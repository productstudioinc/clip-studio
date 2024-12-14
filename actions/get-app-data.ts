import { getUser } from '@/actions/auth/user'
import {
  getBackgrounds,
  getMusic,
  getTemplates,
  getUserUploads
} from '@/actions/db/page-data'
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries'
import { getLibraryVoices, getVoices } from '@/actions/elevenlabs'

import type { AppData } from '@/types/app-data'

export async function getAppData(): Promise<AppData> {
  const [
    { user },
    voices,
    libraryVoices,
    templates,
    backgrounds,
    music,
    uploads,
    socialMediaAccounts
  ] = await Promise.all([
    getUser(),
    getVoices(),
    getLibraryVoices({}),
    getTemplates(),
    getBackgrounds(),
    getMusic(),
    getUserUploads(),
    fetchUserConnectSocialMediaAccounts()
  ])

  return {
    user,
    voices,
    libraryVoices,
    templates,
    backgrounds,
    music,
    youtubeChannels: socialMediaAccounts.youtubeChannels,
    tiktokAccounts: socialMediaAccounts.tiktokAccounts,
    userUploads: uploads
  }
}
