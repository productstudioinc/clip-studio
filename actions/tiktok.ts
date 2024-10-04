'use server'

import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'
// import { db } from '@/db';
// import { tiktokAccounts } from '@/db/schema';
import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import { db } from '@/db'
import {
  socialMediaPosts,
  tiktokAccounts,
  tiktokPosts,
  userUsage
} from '@/db/schema'
import {
  endingFunctionString,
  errorString,
  startingFunctionString
} from '@/utils/logging'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { Logger } from 'next-axiom'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

export const connectTiktokAccount = async () => {
  const { user } = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_REDIRECT_URI) {
    throw new Error('TikTok credentials not configured')
  }

  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString(
    'base64'
  )
  const scope = 'user.info.profile,user.info.stats,video.publish,video.upload'
  const code_challenge = createHash('sha256')
    .update(generateRandomString(128))
    .digest('hex')

  const authUrlParams = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    scope: scope,
    response_type: 'code',
    redirect_uri: process.env.TIKTOK_REDIRECT_URI,
    state: state,
    code_challenge: code_challenge,
    code_challenge_method: 'S256'
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${authUrlParams.toString()}`

  redirect(authUrl)
}

const generateRandomString = (length: number) => {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const deleteTiktokAccount = createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const logger = new Logger().with({
      function: 'deleteTiktokAccount',
      accountId: input.id
    })
    const { user } = await getUser()
    if (!user) {
      throw new ZSAError(
        'NOT_AUTHORIZED',
        'You must be authorized to perform this action.'
      )
    }
    try {
      await db.transaction(async (tx) => {
        // Delete TikTok posts
        await tx
          .delete(tiktokPosts)
          .where(
            and(
              eq(tiktokPosts.userId, user.id),
              eq(tiktokPosts.tiktokAccountId, input.id)
            )
          )

        // Delete social media posts
        await tx
          .delete(socialMediaPosts)
          .where(
            and(
              eq(socialMediaPosts.userId, user.id),
              inArray(
                socialMediaPosts.id,
                db
                  .select({ id: tiktokPosts.parentSocialMediaPostId })
                  .from(tiktokPosts)
                  .where(eq(tiktokPosts.tiktokAccountId, input.id))
              )
            )
          )

        // Delete the TikTok account
        await tx
          .delete(tiktokAccounts)
          .where(
            and(
              eq(tiktokAccounts.userId, user.id),
              eq(tiktokAccounts.id, input.id)
            )
          )

        // Increase the number of connected accounts
        await tx
          .update(userUsage)
          .set({
            connectedAccountsLeft: sql`connected_accounts_left + 1`
          })
          .where(eq(userUsage.userId, user.id))
      })
      revalidatePath('/account')
      await logger.flush()
    } catch (error) {
      if (error instanceof Error) {
        throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
      }
    }
  })

type TikTokRefreshTokenResponse = {
  access_token?: string
  expires_in?: number
  open_id?: string
  refresh_expires_in?: number
  refresh_token?: string
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

const refreshTikTokAccessToken = async ({
  refreshToken,
  id
}: {
  refreshToken: string
  id: string
}) => {
  const logger = new Logger().with({
    function: 'refreshTikTokAccessToken',
    refreshToken,
    id
  })
  logger.info(startingFunctionString)

  try {
    const response = await fetch(
      'https://open.tiktokapis.com/v2/oauth/token/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_key=${process.env.TIKTOK_CLIENT_KEY}&client_secret=${process.env.TIKTOK_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshToken}`
      }
    )

    const { error, error_description, refresh_token, access_token } =
      (await response.json()) as TikTokRefreshTokenResponse

    if (error) {
      logger.error(errorString, { error, error_description })
      await logger.flush()
      throw Error(error)
    }

    await db
      .update(tiktokAccounts)
      .set({
        refreshToken: refresh_token,
        accessToken: access_token,
        updatedAt: new Date()
      })
      .where(eq(tiktokAccounts.id, id))

    logger.info(endingFunctionString)
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    throw error
  }

  await logger.flush()
}

type TikTokCreatorInfoErrorCode =
  | 'ok'
  | 'spam_risk_too_many_posts'
  | 'spam_risk_user_banned_from_posting'
  | 'reached_active_user_cap'
  | 'unaudited_client_can_only_post_to_private_accounts'
  | 'access_token_invalid'
  | 'scope_not_authorized'
  | 'rate_limit_exceeded'
  | 'internal_error'

type TikTokCreatorInfoResponse = {
  data: {
    creator_avatar_url: string
    creator_username: string
    creator_nickname: string
    privacy_level_options: string[]
    comment_disabled: boolean
    duet_disabled: boolean
    stitch_disabled: boolean
    max_video_post_duration_sec: number
  }
  error: {
    code: TikTokCreatorInfoErrorCode
    message: string
    logid: string
  }
}

export const fetchCreatorInfo = async (accessToken: string) => {
  const logger = new Logger().with({
    function: 'fetchCreatorInfo',
    accessToken
  })
  const response = await fetch(
    'https://open.tiktokapis.com/v2/post/publish/creator_info/query/',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      }
    }
  )
  const { data, error } = (await response.json()) as TikTokCreatorInfoResponse
  if (error.code !== 'ok') {
    logger.error(errorString, error)
    await logger.flush()
  }

  return { data, errorMessage: generateErrorMessage(error.code) }
}

const generateErrorMessage = (error: TikTokCreatorInfoErrorCode) => {
  switch (error) {
    case 'ok':
      return
    case 'spam_risk_too_many_posts':
      return "You've posted too many times recently — please try again later"
    case 'spam_risk_user_banned_from_posting':
      return "You've been banned from posting — please contact TikTok support if you believe this is an error"
    case 'reached_active_user_cap':
      return "You've reached the maximum number of active posts — please try again later"
    case 'unaudited_client_can_only_post_to_private_accounts':
      return 'You can only post to private accounts — please try again later'
    case 'access_token_invalid':
      return 'Your access token is invalid — please reconnect your account and try again'
    case 'scope_not_authorized':
      return 'Your scope is not authorized — please reconnect your account and try again'
    case 'rate_limit_exceeded':
      return "You've posted too many times recently — please try again later"
    case 'internal_error':
      return 'It seems like TikTok is having some issues — please try again later'
  }
}

export const refreshTikTokAccessTokens = async () => {
  const logger = new Logger().with({
    function: 'refreshTikTokAccessTokens'
  })
  logger.info(startingFunctionString)

  try {
    const accounts = await db.select().from(tiktokAccounts)

    if (accounts.length === 0) {
      logger.error(errorString, {
        error: 'No data returned from tiktok accounts'
      })
      throw new Error('No TikTok accounts found')
    }

    for (const account of accounts) {
      await refreshTikTokAccessToken({
        refreshToken: account.refreshToken,
        id: account.id
      })
    }

    logger.info(endingFunctionString, {
      numberOfAccounts: accounts.length
    })
  } catch (error) {
    if (error instanceof Error) {
      logger.error(errorString, {
        error: error.message
      })
      throw error
    }
  } finally {
    await logger.flush()
  }
}

type StatusCode = 'PROCESSING_DOWNLOAD' | 'PUBLISH_COMPLETE' | 'FAILED'

type FailureReason =
  | 'file_format_check_failed'
  | 'duration_check_failed'
  | 'frame_rate_check_failed'
  | 'picture_size_check_failed'
  | 'internal'
  | 'video_pull_failed'
  | 'photo_pull_failed'
  | 'publish_cancelled'

type ErrorCode =
  | 'ok'
  | 'invalid_publish_id'
  | 'token_not_authorized_for_specified_publish_id'
  | 'access_token_invalid'
  | 'scope_not_authorized'
  | 'rate_limit_exceeded'
  | 'internal_error'

type TikTokPublishStatusResponseType = {
  data: {
    status: StatusCode
    fail_reason?: FailureReason
    publicaly_available_post_id: [string]
    uploaded_bytes: number
  }
  error: {
    code: ErrorCode
    message: string
    log_id: string
  }
}

export const uploadTiktokPost = createServerAction()
  .input(
    z.object({
      accessToken: z.string(),
      caption: z.string(),
      videoUrl: z.string(),
      parentSocialMediaPostId: z.string(),
      tiktokAccountId: z.string(),
      privacyLevel: z.enum([
        'PUBLIC_TO_EVERYONE',
        'SELF_ONLY',
        'MUTUAL_FOLLOW_FRIENDS',
        'FOLLOWER_OF_CREATOR'
      ]),
      videoCoverTimestampMs: z.number().default(0),
      disableDuet: z.boolean().default(false),
      disableStitch: z.boolean().default(false),
      disableComments: z.boolean().default(false),
      discloseVideoContent: z.boolean().default(false),
      videoContentType: z.enum(['yourBrand', 'brandedContent']).optional(),
      isAiGenerated: z.boolean().default(false)
    })
  )
  .handler(async ({ input }) => {
    const logger = new Logger().with({
      function: 'uploadTiktokPost',
      ...input
    })
    const { user } = await getUser()
    if (!user) {
      throw new ZSAError(
        'NOT_AUTHORIZED',
        'You are not authorized to perform this action.'
      )
    }
    const body = {
      post_info: {
        title: input.caption,
        privacy_level: input.privacyLevel,
        disable_duet: input.disableDuet,
        disable_stitch: input.disableStitch,
        disable_comment: input.disableComments,
        video_cover_timestamp_ms: input.videoCoverTimestampMs,
        brand_organic_toggle:
          input.videoContentType === 'yourBrand' ? true : false,
        brand_content_toggle:
          input.videoContentType === 'brandedContent' ? true : false,
        is_aigc: input.isAiGenerated
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: input.videoUrl
      }
    }
    const response = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(body)
      }
    )

    const { data, error } = (await response.json()) as {
      data?: {
        publish_id: string
      }
      error?: {
        code: string
        message: string
        log_id: string
      }
    }

    if (!response.ok) {
      logger.error(errorString, {
        error: 'Failed to upload video to TikTok',
        ...error
      })
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to upload video to TikTok'
      )
    }
    if (!data) {
      logger.error(errorString, {
        error: 'Failed to upload video to TikTok, no data returned'
      })
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to upload video to TikTok'
      )
    }

    const [data2, err] = await checkTiktokPublishStatus({
      publishId: data.publish_id,
      accessToken: input.accessToken
    })
    if (err) {
      throw err
    } else {
      try {
        await db.insert(tiktokPosts).values({
          userId: user.id,
          publishId: data.publish_id,
          parentSocialMediaPostId: input.parentSocialMediaPostId,
          caption: input.caption,
          privacyLevel: input.privacyLevel,
          disableComment: input.disableComments,
          disableDuet: input.disableDuet,
          disableStitch: input.disableStitch,
          videoCoverTimestampMs: 0,
          tiktokAccountId: input.tiktokAccountId
        })
      } catch (error) {
        logger.error(errorString, {
          error: error instanceof Error ? error.message : String(error)
        })
        throw new ZSAError(
          'INTERNAL_SERVER_ERROR',
          'Failed to save TikTok post to database'
        )
      }
    }
  })

export const checkTiktokPublishStatus = createServerAction()
  .input(
    z.object({
      publishId: z.string(),
      accessToken: z.string()
    })
  )
  .handler(async ({ input }) => {
    const logger = new Logger().with({
      function: 'checkTiktokPublishStatus',
      ...input
    })

    const { publishId, accessToken } = input

    let numberOfPolls = 0
    const maxNumberOfPolls = 15
    let statusCode: StatusCode | null = null

    const url = `https://open.tiktokapis.com/v2/post/publish/status/fetch/`

    while (numberOfPolls <= maxNumberOfPolls) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          publish_id: publishId
        })
      })

      const { error, data }: TikTokPublishStatusResponseType =
        await response.json()

      if (error) {
        handleTikTokPublishError(error.code)
      }

      statusCode = data.status
      handleTikTokPublishStatus(statusCode, data.fail_reason)

      if (statusCode === 'PUBLISH_COMPLETE') {
        logger.info('TikTok publish completed successfully', { statusCode })
        await logger.flush()
        return
      }

      logger.info('Checked TikTok publish status', {
        statusCode,
        numberOfPolls
      })
      numberOfPolls++

      if (numberOfPolls <= maxNumberOfPolls) {
        await new Promise((resolve) => setTimeout(resolve, 15000))
      } else {
        logger.error('Status check timed out')
        await logger.flush()
        throw new ZSAError('INTERNAL_SERVER_ERROR', 'Status check timed out')
      }
    }
  })

const handleTikTokPublishError = (error: ErrorCode) => {
  switch (error) {
    case 'invalid_publish_id':
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Something went wrong making your post. Please try again.'
      )
    case 'token_not_authorized_for_specified_publish_id':
      throw new ZSAError(
        'NOT_AUTHORIZED',
        "It seems like you didn't have the right permissions to post this video. Please reconnect your account and try again."
      )
    case 'access_token_invalid':
      throw new ZSAError(
        'NOT_AUTHORIZED',
        "It seems like you didn't have the right permissions to post this video. Please reconnect your account and try again."
      )
    case 'scope_not_authorized':
      throw new ZSAError(
        'FORBIDDEN',
        "It seems like you didn't have the right permissions to post this video. Please reconnect your account and try again."
      )
    case 'rate_limit_exceeded':
      throw new ZSAError(
        'TOO_MANY_REQUESTS',
        "You've made too many requests to TikTok recently. Please try again in a few minutes."
      )
    case 'internal_error':
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Something went wrong making your post. Please try again.'
      )
    case 'ok':
      return
    default:
      throw new ZSAError(
        'ERROR',
        'Something went wrong making your post. Please try again.'
      )
  }
}

const handleTikTokPublishStatus = (
  status: StatusCode,
  failReason?: FailureReason
) => {
  switch (status) {
    case 'PUBLISH_COMPLETE':
      return
    case 'FAILED':
      switch (failReason) {
        case 'file_format_check_failed':
          throw new ZSAError(
            'UNPROCESSABLE_CONTENT',
            "You've uploaded an incompatible file. Please try again with a different file."
          )
        case 'duration_check_failed':
          throw new ZSAError(
            'UNPROCESSABLE_CONTENT',
            "You've uploaded a video that is too long. Please try again with a shorter video."
          )
        case 'frame_rate_check_failed':
          throw new ZSAError(
            'UNPROCESSABLE_CONTENT',
            'Your video has an unsupported frame rate.'
          )
        case 'picture_size_check_failed':
          throw new ZSAError(
            'PAYLOAD_TOO_LARGE',
            "You've uploaded a picture that is too large. Please try a smaller photo."
          )
        case 'internal':
          throw new ZSAError(
            'INTERNAL_SERVER_ERROR',
            'Something went wrong making your post. Please try again.'
          )
        case 'video_pull_failed':
          throw new ZSAError(
            'ERROR',
            'Something went wrong making your post. Please try again.'
          )
        case 'photo_pull_failed':
          throw new ZSAError(
            'ERROR',
            'Something went wrong making your post. Please try again.'
          )
        case 'publish_cancelled':
          throw new ZSAError(
            'ERROR',
            'Something went wrong making your post. Please try again.'
          )
      }
    case 'PROCESSING_DOWNLOAD':
      return
  }
}
