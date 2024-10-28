import crypto from 'crypto'

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
const API_TOKEN = process.env.FACEBOOK_PIXEL_ACCESS_TOKEN
const ACTION_SOURCE = 'website'
const API_VERSION = 'v21.0'
const TEST_EVENT_CODE = 'TEST36854'
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${API_TOKEN}`

// API reference
// https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper

interface RequestBody {
  data: MetaEventParams[]
  test_event_code?: string
}

interface MetaEventParams {
  event_name: MetaStandardEvent
  event_time: number
  user_data: {
    em?: string // Hashed email address
    ph?: string // Hashed phone number
    ge?: string // Gender: 'f' or 'm'
    db?: string // Date of birth YYYYMMDD format
    ln?: string // Hashed last name
    fn?: string // Hashed first name
    ct?: string // Hashed city
    st?: string // Hashed state/province
    zp?: string // Hashed zip/postal code
    country?: string // 2-letter country code
    external_id?: string // Hashed external ID
    client_ip_address?: string // IPv4 or IPv6 address
    client_user_agent?: string // User agent string
    fbc?: string // Facebook click ID
    fbp?: string // Facebook browser ID
    subscription_id?: string // Subscription ID
    fb_login_id?: string // Facebook login ID
    lead_id?: string // Lead ID
    madid?: string // Mobile advertiser ID
    anon_id?: string // Anonymous ID
    docn?: string // Hashed date of birth day
    doby?: string // Date of birth year (YYYY)
    dobm?: string // Date of birth month (MM)
  }
  custom_data?: {
    value?: number
    currency?: string
    content_name?: string
    content_category?: string
    content_ids?: string[]
    contents?: Array<{ id: string; quantity: number }>
    content_type?: string
    order_id?: string
    predicted_ltv?: number
    num_items?: number
    search_string?: string
    status?: string
    delivery_category?: string
    custom_properties?: Record<string, any>
  }
  event_source_url?: string
  action_source?: string
  event_id?: string
  opt_out?: boolean
}

type MetaStandardEvent =
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'InitiateCheckout'
  | 'Lead'
  | 'PageView'
  | 'Purchase'
  | 'Schedule'
  | 'Search'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | 'ViewContent'

function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

async function sendMetaEvent(
  eventParams: Partial<MetaEventParams>
): Promise<void> {
  try {
    const url = new URL(BASE_URL)

    const body: RequestBody = {
      data: [
        {
          event_time: Math.floor(new Date().getTime() / 1000),
          action_source: ACTION_SOURCE,
          ...eventParams
        } as MetaEventParams
      ]
    }

    if (process.env.NODE_ENV === 'development') {
      body.test_event_code = TEST_EVENT_CODE
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const responseText = await response.text()

    if (response.ok) {
      console.log('Meta event sent successfully', responseText)
    } else {
      console.error(
        'Error sending Meta event:',
        response.status,
        response.statusText,
        responseText
      )
    }
  } catch (error) {
    console.error('Error sending Meta event:', error)
  }
}

export async function trackSignupEvent(params: {
  email: string
  testEventCode?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await sendMetaEvent({
    event_name: 'CompleteRegistration',
    user_data: {
      em: hash(params.email),
      client_ip_address: params.ipAddress,
      client_user_agent: params.userAgent
    },
    event_source_url: 'https://clip.studio/login'
  })
}

export async function trackPurchaseEvent(params: {
  email: string
  currency: string
  value: number
  testEventCode?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await sendMetaEvent({
    event_name: 'Purchase',
    user_data: {
      em: hash(params.email),
      client_ip_address: params.ipAddress,
      client_user_agent: params.userAgent
    },
    custom_data: {
      currency: params.currency,
      value: params.value
    },
    event_source_url: 'https://clip.studio'
  })
}

export async function trackSubscriptionEvent(params: {
  email: string
  testEventCode?: string
}): Promise<void> {
  await sendMetaEvent({
    event_name: 'Subscribe',
    user_data: {
      em: hash(params.email)
    },
    event_source_url: 'https://clip.studio/pricing'
  })
}
