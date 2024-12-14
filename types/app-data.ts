import type {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import type {
  ElevenlabsLibraryVoice,
  ElevenlabsVoice
} from '@/actions/elevenlabs'
import type {
  SelectBackgroundWithParts,
  SelectMusic,
  SelectTemplates,
  SelectUserUploads
} from '@/db/schema'
import { User } from '@supabase/supabase-js'

type SocialMediaAccounts = {
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
}

export type AppData = {
  user: User | null
  voices: ElevenlabsVoice[]
  libraryVoices: ElevenlabsLibraryVoice[]
  backgrounds: SelectBackgroundWithParts[]
  music: SelectMusic[]
  templates: SelectTemplates[]
  userUploads: SelectUserUploads[]
} & SocialMediaAccounts
