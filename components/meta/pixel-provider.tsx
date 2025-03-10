'use client'

import { createContext, useContext, useState } from 'react'
import Script from 'next/script'

import type { Facebook } from '@/types/meta'

/**
 * The context for the FacebookPixel component.
 */
const FacebookPixelContext = createContext<{
  loaded: boolean
  debug?: boolean
} | null>(null)

/**
 * The provider for the FacebookPixel component.
 *
 * @param children - The child components.
 * @returns The FacebookPixelProvider component.
 */
export const FacebookPixelProvider = ({
  children,
  pixelId,
  debug,
  advancedMatching
}: {
  children: React.ReactNode
  pixelId?: string
  debug?: boolean
  advancedMatching?: Facebook.Event.ManualAdvancedMatching
}) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <FacebookPixelContext.Provider value={{ loaded, debug }}>
      {children}
      {pixelId ? (
        <Script
          id="fb-pixel"
          src="/scripts/pixel.js"
          strategy="afterInteractive"
          onLoad={() => setLoaded(true)}
          data-pixel-id={pixelId}
          data-pixel-init={JSON.stringify(advancedMatching)}
        />
      ) : null}
    </FacebookPixelContext.Provider>
  )
}

declare global {
  interface Window {
    fbq: (...args: any[]) => void
  }
}

/**
 * Custom hook to access the FacebookPixel context.
 *
 * @returns The FacebookPixel context.
 */
export function useFacebookPixel() {
  const context = useContext(FacebookPixelContext)
  if (context === null) {
    throw new Error(
      'useFacebookPixel must be used within a FacebookTrackingProvider'
    )
  }
  if (!context.loaded) {
    return null
  }

  return {
    /**
     * Sends a custom event to Facebook Pixel.
     */

    track<T extends Facebook.Event.EventName>(
      event: Facebook.Event.EventDataBrowser<T>
    ) {
      if (context.debug) {
        console.log('Facebook Pixel: ', event)
      }
      window.fbq('track', event.event_name, event.custom_data, {
        eventID: event.event_id
      })
    },

    /**
     * Grants consent to Facebook Pixel.
     */
    grantConsent() {
      if (context.debug) {
        console.log('Facebook Pixel: Consent granted')
      }

      window.fbq('consent', 'grant')
    },

    /**
     * Revokes consent to Facebook Pixel.
     */
    revokeConsent() {
      if (context.debug) {
        console.log('Facebook Pixel: Consent revoked')
      }

      window.fbq('consent', 'revoke')
    },

    init(pixelId: string) {
      if (context.debug) {
        console.log('Facebook Pixel: Init', pixelId)
      }

      window.fbq('init', pixelId)
    }
  }
}
