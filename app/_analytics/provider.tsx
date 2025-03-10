'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider, usePostHog } from 'posthog-js/react'

import { useUser } from '@/lib/hooks/useUser'

export function PHProvider({
  children,
  bootstrapData
}: {
  children: React.ReactNode
  bootstrapData: any
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        capture_pageleave: true,
        bootstrap: bootstrapData
      })
    }
  }, [])

  if (typeof window === 'undefined') return <>{children}</>

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
    if (user) {
      posthog.identify(user.email, {
        email: user.email,
        name: user.user_metadata?.full_name
      })
    }
  }, [user, posthog])

  return <>{children}</>
}
