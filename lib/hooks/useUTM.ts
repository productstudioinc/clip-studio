'use client'

import { UTM_COOKIE_NAME } from '@/utils/constants'
import { CookieValueTypes, getCookie, setCookie } from 'cookies-next'

import { UTMs } from '@/types/utm'

const useUTMs = () => {
  /**
   * Returns UTMs from cookie.
   */
  const getUTMsFromCookie = (): Partial<UTMs> | null => {
    const cookie = getCookie(UTM_COOKIE_NAME) as CookieValueTypes
    return cookie ? JSON.parse(cookie) : null
  }

  /**
   * Sets the tracking cookie.
   */
  const setUTMCookie = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const utm_source = urlParams.get('utm_source') || undefined
    const utm_medium = urlParams.get('utm_medium') || undefined
    const utm_campaign = urlParams.get('utm_campaign') || undefined
    const utm_content = urlParams.get('utm_content') || undefined
    const utm_term = urlParams.get('utm_term') || undefined
    const UTMs = {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term
    }

    // UTM source is a required param for GA to work.
    if (utm_source) {
      setCookie(UTM_COOKIE_NAME, UTMs, {
        path: '/',
        domain: window.location.hostname,
        secure: window.location.protocol === 'https' ? true : false,
        httpOnly: false,
        sameSite: 'strict'
      })
    }
  }

  /**
   * Deletes the tracking cookie.
   */
  const deleteUTMCookie = () => {
    setCookie(UTM_COOKIE_NAME, '', {
      path: '/',
      domain: window.location.hostname,
      secure: window.location.protocol === 'https' ? true : false,
      httpOnly: false,
      sameSite: 'strict',
      expires: new Date(0)
    })
  }

  /**
   *
   * @param url URL to add UTMs to
   * @returns URL string with UTMs added to searchParams
   */
  const addUTMsToUrl = (url: string) => {
    const urlObj = new URL(url)
    const utms = getUTMsFromCookie()
    if (!utms) return url
    const searchParams = new URLSearchParams(urlObj.search)
    Object.entries(utms).forEach(([key, value]) => {
      searchParams.append(key, value)
    })
    urlObj.search = searchParams.toString()
    return urlObj.toString()
  }

  return {
    cookieName: UTM_COOKIE_NAME,
    getUTMsFromCookie,
    setUTMCookie,
    deleteUTMCookie,
    addUTMsToUrl
  }
}

export default useUTMs
