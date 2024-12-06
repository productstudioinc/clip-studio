'use client'

import { usePostHog } from 'posthog-js/react'

import { AuroraText } from '@/components/magicui/aurora-text'

const headlines = {
  control: (
    <>
      Create <AuroraText>Viral Videos</AuroraText> in Seconds Using AI
    </>
  ),
  faceless_channels: (
    <>
      Run <AuroraText>Faceless Channels</AuroraText> on Autopilot
    </>
  ),
  content_empire: (
    <>
      Build Your <AuroraText>Content Empire</AuroraText> Without a Video Editor
    </>
  ),
  million_views: (
    <>
      Get <AuroraText>Millions of Views</AuroraText> on Autopilot
    </>
  ),
  days_of_videos: (
    <>
      Make <AuroraText>30 Days of Videos in 30 Minutes</AuroraText> Using AI
    </>
  )
}

export function Headline() {
  const posthog = usePostHog()
  const variant = posthog.getFeatureFlag('landing-page-headline') || 'control'
  const headline = headlines[variant as keyof typeof headlines]

  // Uncomment to override the headline
  // posthog.featureFlags.override({
  //   'landing-page-headline': 'days_of_videos'
  // })

  return headline
}
