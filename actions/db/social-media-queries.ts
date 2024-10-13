import { cache } from 'react'
import { db } from '@/db'
import { tiktokAccounts, youtubeChannels } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Credentials } from 'google-auth-library'
import { Logger } from 'next-axiom'

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

export const fetchUserConnectSocialMediaAccounts = cache(
  async (userId: string) => {
    const logger = new Logger().with({
      userId,
      function: 'fetchUserConnectSocialMediaAccounts'
    })
    try {
      const [youtubeChannelsResponse, tiktokAccountsResponse] =
        await Promise.all([
          db
            .select()
            .from(youtubeChannels)
            .where(eq(youtubeChannels.userId, userId)),
          db
            .select()
            .from(tiktokAccounts)
            .where(eq(tiktokAccounts.userId, userId))
        ])

      logger.info('Fetched social media accounts', {
        userId,
        youtubeChannelCount: youtubeChannelsResponse.length,
        tiktokAccountCount: tiktokAccountsResponse.length
      })

      const [youtubeChannelsWithSignedUrl, tiktokAccountsWithSignedUrl] =
        await Promise.all([
          Promise.all(youtubeChannelsResponse.map(processYoutubeChannel)),
          Promise.all(tiktokAccountsResponse.map(processTikTokAccount))
        ])

      logger.info('Processed social media accounts', {
        userId,
        processedYouTubeChannelCount: youtubeChannelsWithSignedUrl.length,
        processedTikTokAccountCount: tiktokAccountsWithSignedUrl.length
      })

      await logger.flush()
      return {
        youtubeChannels: youtubeChannelsWithSignedUrl,
        tiktokAccounts: tiktokAccountsWithSignedUrl
      }
    } catch (error) {
      logger.error('Error fetching user connected social media accounts', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw error
    }
  }
)

async function processYoutubeChannel(channel: any): Promise<YoutubeChannel> {
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

async function processTikTokAccount(account: any): Promise<TikTokAccount> {
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
