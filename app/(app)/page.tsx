import { getUser } from '@/actions/auth/user'
import { getBackgrounds, getMusic, getTemplates } from '@/actions/db/page-data'
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries'
import { getVoices } from '@/actions/elevenlabs'

import { RootForm } from '@/components/forms/root-form'

export default async function Page() {
  const [{ user }, voices, templates, backgrounds, music] = await Promise.all([
    getUser(),
    getVoices(),
    getTemplates(),
    getBackgrounds(),
    getMusic()
  ])

  const { youtubeChannels, tiktokAccounts } = user
    ? await fetchUserConnectSocialMediaAccounts(user.id)
    : { youtubeChannels: [], tiktokAccounts: [] }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <RootForm
        voices={voices}
        templates={templates}
        backgrounds={backgrounds}
        music={music}
        youtubeChannels={youtubeChannels}
        tiktokAccounts={tiktokAccounts}
      />
    </div>
  )
}
