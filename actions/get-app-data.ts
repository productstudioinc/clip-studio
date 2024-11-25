import { getUser } from '@/actions/auth/user'
import { getBackgrounds, getMusic, getTemplates } from '@/actions/db/page-data'
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries'
import { getLibraryVoices, getVoices } from '@/actions/elevenlabs'

import type { AppData } from '@/types/app-data'

export async function getAppData(): Promise<AppData> {
  const [{ user }, voices, libraryVoices, templates, backgrounds, music] =
    await Promise.all([
      getUser(),
      getVoices(),
      getLibraryVoices({}),
      getTemplates(),
      getBackgrounds(),
      getMusic()
    ])

  const { youtubeChannels, tiktokAccounts } = user
    ? await fetchUserConnectSocialMediaAccounts(user.id)
    : { youtubeChannels: [], tiktokAccounts: [] }

  return {
    user,
    voices,
    libraryVoices,
    templates,
    backgrounds,
    music,
    youtubeChannels,
    tiktokAccounts
  }
}
