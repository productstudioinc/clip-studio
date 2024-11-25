import { cookies, headers } from 'next/headers'

import type { Facebook } from '@/types/meta'

/**
 * Retrieves the client IP address from the request headers.
 * If the IP address is not available, it falls back to '0.0.0.0'.
 * @returns The client IP address.
 */
export async function getIp(): Promise<string> {
  const FALLBACK_IP_ADDRESS = '0.0.0.0'
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS
  }

  return headersList.get('x-real-ip') ?? FALLBACK_IP_ADDRESS
}

async function getCity(): Promise<string | undefined> {
  const headersList = await headers()

  return (
    headersList.get('x-vercel-ip-city') ??
    headersList.get('cf-ipcity') ??
    headersList.get('x-city') ??
    undefined
  )
}

async function getRegion(): Promise<string | undefined> {
  const headersList = await headers()

  return (
    headersList.get('x-vercel-ip-country-region') ??
    headersList.get('cf-region') ??
    headersList.get('x-region') ??
    undefined
  )
}

async function getCountry(): Promise<string | undefined> {
  const headersList = await headers()

  return (
    headersList.get('x-vercel-ip-country') ??
    headersList.get('cf-ipcountry') ??
    headersList.get('x-country') ??
    undefined
  )
}

export async function getFbc(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const headersList = await headers()
  const referer = headersList.get('referer')

  if (referer) {
    const fbclid = new URL(referer).searchParams.get('fbclid')

    if (fbclid) {
      const version = 'fb'
      const url = new URL(referer)
      const subdomainIndex = url.hostname.split('.').length.toString()
      const creationTime = Math.floor(Date.now() / 1000).toString()
      return `${version}.${subdomainIndex}.${creationTime}.${fbclid}`
    }
  }

  return cookieStore.get('_fbc')?.value
}

export async function getFbp(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('_fbp')?.value
}

/**
 * Retrieves request-related data including user cookies and headers.
 *
 * @returns An object containing user data and event source URL.
 * @property {Object} user_data - Contains user-specific information.
 * @property {string} user_data.fbp - Facebook pixel cookie value.
 * @property {string} user_data.fbc - Facebook click cookie value.
 * @property {string} user_data.client_ip_address - Client's IP address.
 * @property {string} user_data.client_user_agent - Client's user agent string.
 * @property {string} event_source_url - The referring URL.
 */

export async function getRequestData(): Promise<Facebook.Event.RequestData> {
  const headersList = await headers()

  return {
    user_data: {
      city: await getCity(),
      state: await getRegion(),
      country: await getCountry(),
      fbp: await getFbp(),
      fbc: await getFbc(),
      client_ip_address: await getIp(),
      client_user_agent: headersList.get('user-agent') ?? undefined
    },
    event_source_url: headersList.get('referer') ?? undefined
  }
}
