// app/providers.tsx
'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider, usePostHog } from 'posthog-js/react'

import { useUser } from '@/lib/hooks/useUser'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    capture_pageleave: true // Enable pageleave capture
  })
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'production') {
    return <>{children}</>
  }
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PostHogProvider>
  )
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const posthog = usePostHog()
  const { user } = useUser()

  useEffect(() => {
    if (!posthog) return
    if (process.env.NODE_ENV === 'production') {
      if (user) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.user_metadata?.full_name
        })
      }
    }
  }, [user, posthog])

  return <>{children}</>
}
