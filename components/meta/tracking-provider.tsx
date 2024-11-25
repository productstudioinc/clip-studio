import React, { type JSX } from 'react';

import { Facebook } from '@/types/meta'
import type { FacebookTracking } from '@/lib/meta/tracking'

import { FacebookPixelProvider } from './pixel-provider'

/**
 * Provides a wrapper component for Facebook tracking.
 */
export function FacebookTrackingProvider({
  client,
  children,
  advancedMatching
}: {
  /**
   * The Facebook tracking client.
   */
  client: FacebookTracking
  /**
   * The child components to be wrapped.
   */
  children: React.ReactNode
  /**
   * The advanced matching data.
   */
  advancedMatching?: Facebook.Event.ManualAdvancedMatching
}): JSX.Element {
  return (
    <FacebookPixelProvider
      pixelId={client.config.pixelId}
      debug={client.config.debug}
      advancedMatching={advancedMatching}
    >
      {children}
    </FacebookPixelProvider>
  )
}
