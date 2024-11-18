import {
  deletePriceRecord,
  deleteProductRecord,
  manageSubscriptionStatusChange,
  updateUserUsageLimits,
  upsertPriceRecord,
  upsertProductRecord
} from '@/actions/db/billing-queries'
import { stripe } from '@/utils/stripe/config'
import { AxiomRequest, withAxiom } from 'next-axiom'
import Stripe from 'stripe'

import { facebook } from '@/lib/meta'

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

async function sendMetaSubscribeEvent(session: Stripe.Checkout.Session) {
  await facebook.track({
    event_name: 'Subscribe',
    event_id: session.id,
    custom_data: {
      value: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || 'USD'
    },
    user_data: {
      external_id: session.customer?.toString() || undefined,
      email: session.customer_details?.email || undefined,
      fbc: session.metadata?.fbc,
      fbp: session.metadata?.fbp,
      first_name: session.customer_details?.name
        ?.split(' ')?.[0]
        ?.toLowerCase(),
      last_name: session.customer_details?.name
        ? session.customer_details.name.split(' ').length > 1
          ? session.customer_details.name
              .split(' ')
              .slice(1)
              .join(' ')
              .toLowerCase()
          : undefined
        : undefined,
      phone: session.customer_details?.phone || undefined,
      city: session.customer_details?.address?.city
        ?.toLowerCase()
        .replace(/\s+/g, ''),
      state: session.customer_details?.address?.state?.toLowerCase(),
      zip: session.customer_details?.address?.postal_code?.toLowerCase(),
      country: session.customer_details?.address?.country?.toLowerCase()
    }
  })
}

async function sendDiscordWebhook(subscription: Stripe.Subscription) {
  const webhookUrl = process.env.DISCORD_SUB_WEBHOOK
  if (!webhookUrl) {
    throw new Error('Discord webhook URL not found')
  }

  const product = await stripe.products.retrieve(
    subscription.items.data[0].price.product as string
  )

  const message = {
    content: `New subscription created!`,
    embeds: [
      {
        title: 'Subscription Details',
        fields: [
          { name: 'Subscription ID', value: subscription.id },
          { name: 'Customer ID', value: subscription.customer as string },
          { name: 'Status', value: subscription.status },
          {
            name: 'Plan',
            value: product.name
          },
          {
            name: 'Amount',
            value: `${(subscription.items.data[0].price.unit_amount ?? 0) / 100} ${subscription.currency}`
          },
          {
            name: 'Billing Interval',
            value: (() => {
              const recurring = subscription.items.data[0].price.recurring
              if (recurring && recurring.interval) {
                const count = recurring.interval_count || 1
                return `${count} ${recurring.interval}${count > 1 ? 's' : ''}`
              }
              throw new Error(
                'Invalid subscription data: missing recurring interval'
              )
            })()
          }
        ],
        color: 5814783
      }
    ]
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    throw new Error(`Failed to send Discord webhook: ${response.statusText}`)
  }
}

export const POST = withAxiom(async (req: AxiomRequest) => {
  const logger = req.log.with({
    path: '/api/webhooks/route',
    method: req.method
  })

  logger.info('Webhook received')

  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      logger.error('Webhook secret not found')
      await logger.flush()
      return new Response('Webhook secret not found.', { status: 400 })
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    logger.info(`Webhook event constructed`, { eventType: event.type })
  } catch (err: any) {
    logger.error(`Error constructing webhook event`, { error: err.message })
    await logger.flush()
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product)
          logger.info(`Product upserted`, {
            eventType: event.type,
            productId: (event.data.object as Stripe.Product).id
          })
          break
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price)
          logger.info(`Price upserted`, {
            eventType: event.type,
            priceId: (event.data.object as Stripe.Price).id
          })
          break
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price)
          logger.info(`Price deleted`, {
            eventType: event.type,
            priceId: (event.data.object as Stripe.Price).id
          })
          break
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product)
          logger.info(`Product deleted`, {
            eventType: event.type,
            productId: (event.data.object as Stripe.Product).id
          })
          break
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            true
          )
          await updateUserUsageLimits(subscription)
          await sendDiscordWebhook(subscription)
          logger.info(`Subscription created and Discord webhook sent`, {
            eventType: event.type,
            subscriptionId: subscription.id,
            customerId: subscription.customer as string,
            status: subscription.status
          })
          break
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          if (checkoutSession.mode === 'subscription') {
            await sendMetaSubscribeEvent(checkoutSession)
            const subscriptionId = checkoutSession.subscription
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            )
            logger.info(`Checkout session completed`, {
              subscriptionId,
              customerId: checkoutSession.customer as string
            })
          }
          break
        default:
          logger.warn(`Unhandled relevant event`, { eventType: event.type })
          throw new Error('Unhandled relevant event!')
      }
    } catch (error) {
      logger.error(`Webhook handler failed`, {
        error: error instanceof Error ? error.message : String(error),
        eventType: event.type
      })
      await logger.flush()
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      )
    }
  } else {
    logger.warn(`Unsupported event type`, { eventType: event.type })
    await logger.flush()
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    })
  }

  logger.info('Webhook processed successfully', { eventType: event.type })
  await logger.flush()
  return new Response(JSON.stringify({ received: true }))
})
