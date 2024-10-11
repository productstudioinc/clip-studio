'use server'

import { unstable_cache } from 'next/cache'
import { getUser, signOut } from '@/actions/auth/user'
import { db } from '@/db'
import {
  customers,
  feedback,
  pastRenders,
  planLimits,
  prices,
  products,
  socialMediaPosts,
  subscriptions,
  users,
  userUsage
} from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { Logger } from 'next-axiom'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

const logger = new Logger({
  source: 'actions/db/user-queries'
})

export const getProducts = unstable_cache(async () => {
  logger.info('Fetching products')
  try {
    const result = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.active, true),
      columns: {
        id: true,
        name: true,
        description: true,
        metadata: true,
        defaultPriceId: true,
        marketingFeatures: true
      },
      with: {
        prices: {
          columns: {
            id: true,
            productId: true,
            unitAmount: true,
            currency: true,
            interval: true
          }
        }
      }
    })
    logger.info('Products fetched successfully', { count: result.length })
    await logger.flush()
    return result
  } catch (error) {
    logger.error('Error fetching products', {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    throw error
  }
}, ['products'])

export const getUserUsage = async () => {
  const { user } = await getUser()
  if (!user) {
    logger.warn('Attempted to get user usage for unauthenticated user')
    await logger.flush()
    return null
  }

  logger.info('Fetching user usage', { userId: user.id })
  try {
    const result = await db
      .select({
        currentUsage: {
          creditsLeft: userUsage.creditsLeft,
          connectedAccountsLeft: userUsage.connectedAccountsLeft
        },
        totalLimits: {
          credits: sql<number>`COALESCE(${planLimits.totalCredits}, NULL)`.as(
            'credits'
          ),
          connectedAccounts: sql<
            number | null
          >`COALESCE(${planLimits.totalConnectedAccounts}, NULL)`.as(
            'connectedAccounts'
          )
        }
      })
      .from(userUsage)
      .leftJoin(subscriptions, eq(subscriptions.userId, userUsage.userId))
      .leftJoin(prices, eq(subscriptions.priceId, prices.id))
      .leftJoin(products, eq(prices.productId, products.id))
      .leftJoin(planLimits, eq(products.id, planLimits.productId))
      .where(eq(userUsage.userId, user.id))
      .limit(1)

    if (result.length === 0) {
      await logger.flush()
      return null
    }

    logger.info('User usage fetched successfully', { userId: user.id })
    await logger.flush()
    return result[0]
  } catch (error) {
    logger.error('Error fetching user usage', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    throw error
  }
}

export const getVideoRenderHistory = async (
  page: number = 1,
  pageSize: number = 10,
  filter: string = ''
) => {
  const { user } = await getUser()
  if (!user) {
    logger.warn(
      'Attempted to get video render history for unauthenticated user'
    )
    await logger.flush()
    return null
  }
  logger.info('Fetching video render history', {
    userId: user.id,
    page,
    pageSize,
    filter
  })
  try {
    const offset = (page - 1) * pageSize

    const renderHistory = await db
      .select()
      .from(pastRenders)
      .where(
        sql`${pastRenders.userId} = ${user.id} AND (${filter ? sql`${pastRenders.templateName} ILIKE ${`%${filter}%`}` : sql`1=1`})`
      )
      .orderBy(desc(pastRenders.createdAt))
      .limit(pageSize)
      .offset(offset)

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pastRenders)
      .where(
        sql`${pastRenders.userId} = ${user.id} AND (${filter ? sql`${pastRenders.templateName} ILIKE ${`%${filter}%`}` : sql`1=1`})`
      )

    const totalCount = totalCountResult[0].count

    logger.info('Video render history fetched successfully', {
      userId: user.id,
      page,
      pageSize,
      totalCount
    })
    await logger.flush()
    return {
      renderHistory,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page
    }
  } catch (error) {
    logger.error('Error fetching video render history', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    throw error
  }
}

export type GetUserUsageResult = Awaited<ReturnType<typeof getUserUsage>>

export type GetProductsResult = Awaited<ReturnType<typeof getProducts>>

export const createSocialMediaPost = createServerAction()
  .input(z.void())
  .handler(async () => {
    const { user } = await getUser()
    if (!user) {
      logger.warn(
        'Attempted to create social media post for unauthenticated user'
      )
      await logger.flush()
      throw new ZSAError(
        'NOT_AUTHORIZED',
        'You are not authorized to perform this action.'
      )
    }
    logger.info('Creating social media post', { userId: user.id })
    try {
      const result = await db
        .insert(socialMediaPosts)
        .values({
          userId: user.id
        })
        .returning({
          insertedId: socialMediaPosts.id
        })
      logger.info('Social media post created successfully', {
        userId: user.id,
        postId: result[0].insertedId
      })
      await logger.flush()
      return result[0].insertedId
    } catch (error) {
      logger.error('Error creating social media post', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to create social media post'
      )
    }
  })

export const deleteUser = createServerAction()
  .input(z.void())
  .handler(async () => {
    const { user } = await getUser()
    if (!user) {
      logger.warn('Attempted to delete user for unauthenticated user')
      await logger.flush()
      throw new ZSAError(
        'NOT_AUTHORIZED',
        'You are not authorized to perform this action.'
      )
    }
    logger.info('Deleting user', { userId: user.id })
    try {
      await db.delete(customers).where(eq(customers.id, user.id))
      await db.delete(users).where(eq(users.id, user.id))
      await signOut()
      logger.info('User deleted successfully', { userId: user.id })
      await logger.flush()
    } catch (error) {
      logger.error('Error deleting user', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to delete user')
    }
  })

export const submitFeedback = createServerAction()
  .input(
    z.object({
      feedbackType: z.string(),
      rating: z.number(),
      comment: z.string()
    })
  )
  .handler(async ({ input: { feedbackType, rating, comment } }) => {
    const { user } = await getUser()
    if (!user) {
      logger.warn('Attempted to submit feedback for unauthenticated user')
      await logger.flush()
      throw new ZSAError(
        'NOT_AUTHORIZED',
        'You must be logged in to submit feedback.'
      )
    }
    logger.info('Submitting feedback', { userId: user.id })
    try {
      const result = await db.insert(feedback).values({
        userId: user.id,
        feedbackType,
        rating,
        comment
      })
      logger.info('Feedback submitted successfully', { userId: user.id })
      await logger.flush()
      return result
    } catch (error) {
      logger.error('Error submitting feedback', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to submit feedback')
    }
  })
