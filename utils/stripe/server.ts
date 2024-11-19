'use server'

import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import { createOrRetrieveCustomer } from '@/actions/db/billing-queries'
import { Price } from '@/db/schema'
import Stripe from 'stripe'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { getFbc, getFbp } from '@/lib/meta/utils'
import { getUTM } from '@/lib/utm'

import { getURL } from '../helpers/helpers'
import { stripe } from './config'

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
