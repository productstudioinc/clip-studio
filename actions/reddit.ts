'use server'

import { Logger } from 'next-axiom'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

import { getUser } from './auth/user'

const logger = new Logger({
  source: 'actions/reddit'
})

const redditUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => url.includes('reddit.com/r/') && url.includes('/comments/'),
    {
      message: 'Invalid Reddit post URL'
    }
  )

async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials are not configured')
  }

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'User-Agent': 'ClipStudio/1.0.0'
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error('Failed to obtain Reddit access token')
  }

  const data = await response.json()
  return data.access_token
}

export const getRedditInfo = createServerAction()
  .input(redditUrlSchema)
  .output(
    z.object({
      title: z.string(),
      subreddit: z.string(),
      accountName: z.string(),
      text: z.string(),
      likes: z.number(),
      comments: z.number()
    })
  )
  .handler(async ({ input }) => {
    try {
      const user = await getUser()
      if (!user) {
        throw new ZSAError('FORBIDDEN', 'User not found')
      }

      const match = input.match(/\/comments\/([^/]+)\//)
      const postId = match ? match[1] : null

      if (!postId) {
        throw new ZSAError('INPUT_PARSE_ERROR', 'Invalid post ID')
      }

      const accessToken = await getRedditAccessToken()

      const apiUrl = `https://oauth.reddit.com/api/info?id=t3_${postId}`

      // Add retry logic
      const maxRetries = 3
      let retries = 0
      let response: Response | undefined

      while (retries < maxRetries) {
        response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'ClipStudio/1.0.0'
          }
        })

        if (response.status === 403) {
          retries++
          logger.warn('Received 403 from Reddit API, retrying', {
            retryCount: retries
          })
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
        } else {
          break
        }
      }

      if (!response || !response.ok) {
        throw new ZSAError(
          'INTERNAL_SERVER_ERROR',
          `Failed to fetch Reddit post data: ${response?.status} ${response?.statusText}`
        )
      }

      const data = await response.json()
      const post = data.data.children[0]?.data

      if (!post) {
        throw new ZSAError('NOT_FOUND', 'Reddit post not found')
      }

      logger.info('Reddit post fetched successfully', {
        userId: user.user?.id,
        subreddit: post.subreddit,
        postId: postId
      })

      return {
        subreddit: post.subreddit,
        title: post.title,
        accountName: post.author,
        text: post.selftext,
        likes: post.score,
        comments: post.num_comments
      }
    } catch (error) {
      if (error instanceof ZSAError) {
        logger.error('ZSAError in getRedditInfo', {
          errorCode: error.code,
          errorMessage: error.message,
          input: input
        })
        throw error
      } else {
        logger.error('Unexpected error in getRedditInfo', {
          error: error instanceof Error ? error.message : String(error),
          input: input
        })
        throw new ZSAError(
          'INTERNAL_SERVER_ERROR',
          error instanceof Error ? error.message : String(error)
        )
      }
    }
  })
