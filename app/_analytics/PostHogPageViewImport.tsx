'use client'

import dynamic from 'next/dynamic'

export const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false
})
