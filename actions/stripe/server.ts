'use server'

import { getUser } from '@/actions/auth/user'
import { createOrRetrieveCustomer } from '@/actions/db/billing-queries'
import { Price } from '@/db/schema'
import { getURL } from '@/utils/helpers/helpers'
import { stripe } from '@/utils/stripe/config'
import { redirect } from 'next/navigation'
import type Stripe from 'stripe'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { getFbc, getFbp } from '@/lib/meta/utils'
import { getUTM } from '@/lib/utm'

type CheckoutResponse = {
  errorRedirect?: string
  sessionId?: string
}

export const getBillingPortal = createServerAction()
  .input(z.void())
  .handler(async () => {
    const { user } = await getUser()
    if (!user) {
      throw redirect('/login')
    }
    const customerId = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email as string
    })
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId as string,
      return_url: getURL('/')
    })
    return { url: session.url }
  })

export const checkoutWithStripe = createServerAction()
  .input(
    z.object({
      price: Price.partial(),
      redirectPath: z
        .string()
        .default('/success?session_id={CHECKOUT_SESSION_ID}'),
      referralId: z.string().optional()
    })
  )
  .output(
    z.object({
      sessionId: z.string().optional(),
      errorRedirect: z.string().optional()
    })
  )
  .handler(async ({ input }): Promise<CheckoutResponse> => {
    const { user } = await getUser()
    if (!user) {
      throw redirect('/login')
    }
    try {
      const customer = await createOrRetrieveCustomer({
        uuid: user.id,
        email: user.email as string
      })
      const params: Stripe.Checkout.SessionCreateParams = {
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer,
        customer_update: { address: 'auto' },
        line_items: [{ price: input.price.id, quantity: 1 }],
        cancel_url: getURL(),
        mode: 'subscription',
        success_url: getURL(input.redirectPath),
        metadata: {
          tolt_referral: input.referralId ?? null,
          fbc: getFbc() ?? null,
          fbp: getFbp() ?? null,
          utm_source: getUTM('utm_source') ?? null,
          utm_medium: getUTM('utm_medium') ?? null,
          utm_campaign: getUTM('utm_campaign') ?? null,
          utm_content: getUTM('utm_content') ?? null,
          utm_term: getUTM('utm_term') ?? null
        },
        payment_method_collection: 'always'
      }
      const session = await stripe.checkout.sessions.create(params)
      return { sessionId: session.id }
    } catch (error) {
      console.error('Error in checkoutWithStripe:', error)
      return { errorRedirect: getURL() }
    }
  })

export const getStripePriceAmount = createServerAction()
  .input(z.object({ priceId: z.string() }))
  .output(
    z.object({
      amount: z.number().optional(),
      currency: z.string().optional(),
      name: z.string().optional(),
      error: z.string().optional()
    })
  )
  .handler(async ({ input }) => {
    try {
      const price = await stripe.prices.retrieve(input.priceId)
      if (!price.unit_amount) {
        return { error: 'Price not found or has no unit amount' }
      }
      const product = await stripe.products.retrieve(price.product as string)
      return {
        amount: price.unit_amount / 100,
        currency: price.currency,
        name: product.name
      }
    } catch (error) {
      return { error: 'Failed to retrieve price information' }
    }
  })

export const getStripeCustomerData = createServerAction()
  .input(z.object({ customerId: z.string() }))
  .output(
    z
      .object({
        balance: z.number().nullable(),
        currency: z.string().nullable(),
        delinquent: z.boolean().nullable(),
        discount: z.any().nullable()
      })
      .nullable()
  )
  .handler(async ({ input }) => {
    const customer = await stripe.customers.retrieve(input.customerId)

    if (customer.deleted) {
      return null
    }

    return {
      balance: customer.balance,
      currency: customer.currency ?? null,
      delinquent: customer.delinquent ?? null,
      discount: customer.discount ?? null
    }
  })

export const getStripeSubscriptionData = createServerAction()
  .input(z.object({ subscriptionId: z.string() }))
  .output(
    z.object({
      items: z.array(
        z.object({
          id: z.string(),
          quantity: z.number().nullable(),
          price: z.object({
            id: z.string(),
            amount: z.number().nullable(),
            currency: z.string(),
            interval: z.string().nullable(),
            product: z.object({
              name: z.string(),
              description: z.string().nullable()
            })
          })
        })
      ),
      paymentMethod: z
        .object({
          brand: z.string().nullable(),
          last4: z.string().nullable(),
          expiryMonth: z.number().nullable(),
          expiryYear: z.number().nullable()
        })
        .nullable(),
      status: z.string(),
      cancelAt: z.number().nullable(),
      canceledAt: z.number().nullable(),
      startDate: z.number(),
      trialStart: z.number().nullable(),
      trialEnd: z.number().nullable(),
      currentPeriodStart: z.number(),
      currentPeriodEnd: z.number()
    })
  )
  .handler(async ({ input }) => {
    const subscription = await stripe.subscriptions.retrieve(
      input.subscriptionId,
      {
        expand: ['default_payment_method', 'items.data.price.product']
      }
    )

    return {
      items: subscription.items.data.map((item) => ({
        id: item.id,
        quantity: item.quantity ?? null,
        price: {
          id: item.price.id,
          amount: item.price.unit_amount,
          currency: item.price.currency,
          interval: item.price.recurring?.interval ?? null,
          product: {
            name: (item.price.product as Stripe.Product).name,
            description: (item.price.product as Stripe.Product).description
          }
        }
      })),
      paymentMethod: subscription.default_payment_method
        ? {
            brand:
              (subscription.default_payment_method as Stripe.PaymentMethod).card
                ?.brand ?? null,
            last4:
              (subscription.default_payment_method as Stripe.PaymentMethod).card
                ?.last4 ?? null,
            expiryMonth:
              (subscription.default_payment_method as Stripe.PaymentMethod).card
                ?.exp_month ?? null,
            expiryYear:
              (subscription.default_payment_method as Stripe.PaymentMethod).card
                ?.exp_year ?? null
          }
        : null,
      status: subscription.status,
      cancelAt: subscription.cancel_at,
      canceledAt: subscription.canceled_at,
      startDate: subscription.start_date,
      trialStart: subscription.trial_start,
      trialEnd: subscription.trial_end,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end
    }
  })
