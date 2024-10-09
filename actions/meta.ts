'use server'

import { headers } from 'next/headers'
import { stripe } from '@/utils/stripe/config'

import { MetaPixelService } from '@/lib/meta'

export enum MetaEvent {
  PAGE_VIEW = 'PageView',
  COMPLETE_REGISTRATION = 'CompleteRegistration',
  INITIATE_CHECKOUT = 'InitiateCheckout',
  SUBSCRIBE = 'Subscribe'
}

export async function trackEvent(
  eventName: MetaEvent,
  customData: Record<string, any>
) {
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const clientIp = headersList.get('x-forwarded-for') || ''
  const referer = headersList.get('referer') || ''

  await MetaPixelService.sendEvent({
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: referer,
    user_data: {
      client_ip_address: clientIp.split(',')[0], // Get the first IP if there are multiple
      client_user_agent: userAgent
    },
    custom_data: customData
  })
}

export async function trackSubscribeEvent(sessionId: string) {
  // Assuming you have access to Stripe here
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  await trackEvent(MetaEvent.SUBSCRIBE, {
    currency: session.currency,
    value: session.amount_total ? session.amount_total / 100 : 0,
    content_name: 'Subscription',
    content_category: 'Subscription',
    num_items: 1
  })
}

export async function trackRegistrationEvent() {
  await trackEvent(MetaEvent.COMPLETE_REGISTRATION, {
    content_name: 'User Registration',
    status: 'success'
  })
}

export async function trackInitiateCheckoutEvent(
  currency: string,
  value: number
) {
  await trackEvent(MetaEvent.INITIATE_CHECKOUT, {
    currency,
    value,
    content_name: 'Checkout Initiated',
    content_category: 'Checkout',
    num_items: 1
  })
}
