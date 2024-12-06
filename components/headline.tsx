import { getBootstrapData } from '@/actions/get-bootstrap-data'

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

export async function Headline() {
  const bootstrapData = await getBootstrapData()
  const flag = bootstrapData.featureFlags['landing-page-headline']
  const headline = headlines[flag as keyof typeof headlines]
  return headline
}
