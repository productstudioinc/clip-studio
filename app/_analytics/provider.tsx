// app/providers.tsx
'use client'

import { useEffect, useState } from 'react'
import { getUser } from '@/actions/auth/user'
import { User } from '@supabase/supabase-js'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const fetchUser = async () => {
        const { user } = await getUser()
        setUser(user)
      }
      fetchUser()
    }
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      if (user) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.app_metadata.full_name
        })
      } else {
        posthog.reset()
      }
    }
  }, [user])

  return <>{children}</>
}
