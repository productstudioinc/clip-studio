import { db } from '@/db'
import {
  customers,
  planLimits,
  prices,
  products,
  subscriptions,
  users,
  userUsage
} from '@/db/schema'
import { toDateTime } from '@/utils/helpers/helpers'
import { stripe } from '@/utils/stripe/config'
import { and, eq, sql } from 'drizzle-orm'
import Stripe from 'stripe'

const TRIAL_PERIOD_DAYS = 7

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
    marketingFeatures: product.marketing_features?.map(
      (feature) => feature.name ?? ''
    ),
    defaultPriceId:
      typeof product.default_price === 'string' ? product.default_price : null
  }

  try {
    await db.insert(products).values(productData).onConflictDoUpdate({
      target: products.id,
      set: productData
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}

const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3
) => {
  const priceData = {
    id: price.id,
    productId: typeof price.product === 'string' ? price.product : null,
    active: price.active,
    currency: price.currency,
    type: price.type,
    unitAmount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    intervalCount: price.recurring?.interval_count ?? null,
    trialPeriodDays: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS
  }

  try {
    await db.insert(prices).values(priceData).onConflictDoUpdate({
      target: prices.id,
      set: priceData
    })
    console.log(`Price inserted/updated: ${price.id}`)
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('foreign key constraint') &&
        retryCount < maxRetries
      ) {
        console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return upsertPriceRecord(price, retryCount + 1, maxRetries)
      } else if (retryCount >= maxRetries) {
        throw new Error(
          `Price insert/update failed after ${maxRetries} retries: ${error.message}`
        )
      } else {
        throw new Error(`Price insert/update failed: ${error.message}`)
      }
    }
    throw error
  }
}

const deleteProductRecord = async (product: Stripe.Product) => {
  try {
    await db.delete(products).where(eq(products.id, product.id))
    console.log(`Product deleted: ${product.id}`)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Product deletion failed: ${error.message}`)
    }
  }
}

const deletePriceRecord = async (price: Stripe.Price) => {
  try {
    await db.delete(prices).where(eq(prices.id, price.id))
    console.log(`Price deleted: ${price.id}`)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Price deletion failed: ${error.message}`)
    }
  }
}

const upsertCustomerToDb = async (uuid: string, customerId: string) => {
  try {
    await db
      .insert(customers)
      .values({ id: uuid, stripeCustomerId: customerId })
      .onConflictDoUpdate({
        target: customers.id,
        set: { stripeCustomerId: customerId }
      })
    return customerId
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`DB customer record creation failed: ${error.message}`)
    }
  }
}

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email }
  const newCustomer = await stripe.customers.create(customerData)
  if (!newCustomer) throw new Error('Stripe customer creation failed.')
  return newCustomer.id
}

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string
  uuid: string
}) => {
  try {
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, uuid))
      .limit(1)

    let stripeCustomerId: string | undefined
    if (existingCustomer[0]?.stripeCustomerId) {
      const existingStripeCustomer = await stripe.customers.retrieve(
        existingCustomer[0].stripeCustomerId
      )
      stripeCustomerId = existingStripeCustomer.id
    } else {
      const stripeCustomers = await stripe.customers.list({ email: email })
      stripeCustomerId =
        stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined
    }

    const stripeIdToInsert =
      stripeCustomerId ?? (await createCustomerInStripe(uuid, email))
    if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.')

    if (existingCustomer[0] && stripeCustomerId) {
      if (existingCustomer[0].stripeCustomerId !== stripeCustomerId) {
        await db
          .update(customers)
          .set({ stripeCustomerId: stripeCustomerId })
          .where(eq(customers.id, uuid))
        console.warn(
          `DB customer record mismatched Stripe ID. DB record updated.`
        )
      }
      return stripeCustomerId
    } else {
      console.warn(`DB customer record was missing. A new record was created.`)
      return await upsertCustomerToDb(uuid, stripeIdToInsert)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Customer lookup/creation failed: ${error.message}`)
    }
  }
}

const copyBillingDetailsToCustomer = async (
  uuid: string,
  paymentMethod: Stripe.PaymentMethod
) => {
  const customer = paymentMethod.customer as string
  const { name, phone, address } = paymentMethod.billing_details
  if (!name || !phone || !address) return
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address })
  try {
    await db
      .update(users)
      .set({
        billingAddress: { ...address },
        paymentMethod: { ...paymentMethod[paymentMethod.type] }
      })
      .where(eq(users.id, uuid))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Customer update failed: ${error.message}`)
    }
  }
}

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  try {
    const customerData = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.stripeCustomerId, customerId))
      .limit(1)
    if (!customerData[0]) throw new Error('Customer not found')
    const { id: uuid } = customerData[0]
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method']
    })
    const subscriptionData = {
      id: subscription.id,
      userId: uuid,
      metadata: JSON.stringify(subscription.metadata),
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      //@ts-ignore
      quantity: subscription.quantity,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : null,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      created: new Date(subscription.created * 1000),
      endedAt: subscription.ended_at
        ? new Date(subscription.ended_at * 1000)
        : null,
      trial_start: subscription.trial_start
        ? toDateTime(subscription.trial_start).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? toDateTime(subscription.trial_end).toISOString()
        : null
    }
    await db.insert(subscriptions).values(subscriptionData).onConflictDoUpdate({
      target: subscriptions.id,
      set: subscriptionData
    })
    console.log(
      `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
    )
    if (createAction && subscription.default_payment_method && uuid) {
      await copyBillingDetailsToCustomer(
        uuid,
        subscription.default_payment_method as Stripe.PaymentMethod
      )
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Subscription insert/update failed: ${error.message}`)
    }
    throw error // Re-throw other errors
  }
}

const updateUserUsageLimits = async (subscription: Stripe.Subscription) => {
  try {
    if (subscription.status !== 'active') {
      console.log(
        `Skipping usage limit update for subscription ${subscription.id} - status: ${subscription.status}`
      )
      return
    }

    const subscriptionDetails = await db
      .select({
        userId: subscriptions.userId,
        subscriptionId: subscriptions.id,
        creditsLeft: planLimits.totalCredits,
        connectedAccounts: planLimits.totalConnectedAccounts,
        currentPeriodStart: subscriptions.currentPeriodStart
      })
      .from(subscriptions)
      .innerJoin(prices, eq(subscriptions.priceId, prices.id))
      .innerJoin(products, eq(prices.productId, products.id))
      .innerJoin(planLimits, eq(products.id, planLimits.productId))
      .where(
        and(
          eq(subscriptions.status, 'active'),
          eq(subscriptions.id, subscription.id)
        )
      )
      .limit(1)
    if (!subscriptionDetails[0]) {
      throw new Error('No active subscription found')
    }

    const newPeriodStart = new Date(subscription.current_period_start * 1000)
    const existingPeriodStart = subscriptionDetails[0].currentPeriodStart
    const isRenewal =
      existingPeriodStart && newPeriodStart > existingPeriodStart

    await db
      .insert(userUsage)
      .values({
        userId: subscriptionDetails[0].userId,
        creditsLeft: isRenewal
          ? subscriptionDetails[0].creditsLeft
          : sql`LEAST(${userUsage.creditsLeft}, ${subscriptionDetails[0].creditsLeft})`,
        connectedAccountsLeft: subscriptionDetails[0].connectedAccounts,
        lastResetDate: isRenewal ? newPeriodStart : undefined
      })
      .onConflictDoUpdate({
        target: userUsage.userId,
        set: {
          creditsLeft: isRenewal
            ? subscriptionDetails[0].creditsLeft
            : sql`LEAST(COALESCE(${userUsage.creditsLeft}, 0), ${subscriptionDetails[0].creditsLeft})`,
          connectedAccountsLeft: subscriptionDetails[0].connectedAccounts,
          lastResetDate: isRenewal ? newPeriodStart : undefined
        }
      })
    console.log(
      `Updated usage limits for user ${subscriptionDetails[0].userId}${isRenewal ? ' (renewal reset)' : ''}`
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Subscription insert/update failed: ${error.message}`)
    }
  }
}

export {
  createOrRetrieveCustomer,
  deletePriceRecord,
  deleteProductRecord,
  manageSubscriptionStatusChange,
  updateUserUsageLimits,
  upsertPriceRecord,
  upsertProductRecord
}
