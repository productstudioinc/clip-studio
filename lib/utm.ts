import { headers } from 'next/headers'
import { UTM_COOKIE_NAME } from '@/utils/constants'
import { CookieValueTypes, getCookie } from 'cookies-next'

import { UTMs } from '@/types/utm'

export const getUTM = (key: keyof UTMs): string | null => {
  const headersList = headers()
  const referer = headersList.get('referer')

  // First check referer URL params
  if (referer) {
    try {
      const url = new URL(referer)
      const param = url.searchParams.get(key)
      if (param) return param
    } catch {
      // Continue to cookie check if URL parsing fails
    }
  }

  // Then check cookie
  const cookie = getCookie(UTM_COOKIE_NAME) as CookieValueTypes
  if (cookie) {
    try {
      const utms = JSON.parse(cookie) as Partial<UTMs>
      return utms[key] || null
    } catch {
      // Return null if cookie parse fails
    }
  }

  return null
}
