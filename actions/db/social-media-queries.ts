import { cache } from 'react'
import { db } from '@/db'
import { tiktokAccounts, youtubeChannels } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Credentials } from 'google-auth-library'
import { Logger } from 'next-axiom'

import { getUser } from '../auth/user'
import { fetchCreatorInfo } from '../tiktok'
import { getYoutubeChannelInfo } from '../youtube'

const logger = new Logger({
  source: 'actions/db/social-media-queries'
})

export type YoutubeChannel = {
  profile_picture_path: string | null | undefined
  min_video_duration: number
  max_video_duration: number
  max_video_size: number
  error: string
  id: string
  userId: string
  createdAt: Date
  channelCustomUrl: string
  credentials: unknown
  updatedAt: Date
}

export type TikTokAccount = {
  profile_picture_path: string | null
  account_name: string
  min_video_duration: number
  max_video_duration: number
  max_video_size: number
  error: string
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  accessToken: string
  refreshToken: string
}

export const fetchUserConnectSocialMediaAccounts = cache(async () => {
  const logger = new Logger().with({
    function: 'fetchUserConnectSocialMediaAccounts'
  })

  try {
    const { user } = await getUser()
    if (!user) {
      return {
        youtubeChannels: [],
        tiktokAccounts: []
      }
    }

    const [youtubeChannelsResponse, tiktokAccountsResponse] = await Promise.all(
      [
        db
          .select()
          .from(youtubeChannels)
          .where(eq(youtubeChannels.userId, user.id)),
        db
          .select()
          .from(tiktokAccounts)
          .where(eq(tiktokAccounts.userId, user.id))
      ]
    )

    const [youtubeChannelsWithSignedUrl, tiktokAccountsWithSignedUrl] =
      await Promise.all([
        Promise.all(youtubeChannelsResponse.map(processYoutubeChannel)),
        Promise.all(tiktokAccountsResponse.map(processTikTokAccount))
      ])

    return {
      youtubeChannels: youtubeChannelsWithSignedUrl,
      tiktokAccounts: tiktokAccountsWithSignedUrl
    }
  } catch (error) {
    logger.error('Error fetching user connected social media accounts', {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    return {
      youtubeChannels: [],
      tiktokAccounts: []
    }
  }
})

async function processYoutubeChannel(
  channel: typeof youtubeChannels.$inferSelect
): Promise<YoutubeChannel> {
  try {
    const channelInfo = await getYoutubeChannelInfo(
      channel.credentials as Credentials
    )
    return {
      ...channel,
      profile_picture_path: channelInfo?.thumbnail,
      min_video_duration: 3,
      max_video_duration: 60,
      max_video_size: 1024 * 1024 * 1024 * 256,
      error: channelInfo ? '' : 'Please reconnect your Youtube Channel'
    }
  } catch (error) {
    logger.error('Error fetching YouTube channel info', {
      channelId: channel.id,
      error: error instanceof Error ? error.message : String(error)
    })
    return {
      ...channel,
      profile_picture_path: null,
      min_video_duration: 3,
      max_video_duration: 60,
      max_video_size: 1024 * 1024 * 1024 * 256,
      error: 'Error fetching channel info'
    }
  }
}

async function processTikTokAccount(
  account: typeof tiktokAccounts.$inferSelect
): Promise<TikTokAccount> {
  try {
    const { data, errorMessage } = await fetchCreatorInfo(account.accessToken)
    return {
      ...account,
      profile_picture_path: data?.creator_avatar_url ?? null,
      account_name: data?.creator_nickname ?? 'Unknown',
      min_video_duration: 3,
      max_video_duration: data?.max_video_post_duration_sec ?? 0,
      max_video_size: 1024 * 1024 * 1024 * 4,
      error: errorMessage || ''
    }
  } catch (error) {
    logger.error('Error fetching TikTok account info', {
      accountId: account.id,
      error: error instanceof Error ? error.message : String(error)
    })
    return {
      ...account,
      profile_picture_path: null,
      account_name: 'Unknown',
      min_video_duration: 3,
      max_video_duration: 0,
      max_video_size: 1024 * 1024 * 1024 * 4,
      error: 'Error fetching account info'
    }
  }
}
