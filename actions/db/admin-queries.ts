'use server'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getUser } from '@/actions/auth/user'
import { db } from '@/db'
import {
  customers,
  feedback,
  pastRenders,
  subscriptions,
  tiktokAccounts,
  tiktokPosts,
  users,
  userUsage,
  youtubeChannels,
  youtubePosts
} from '@/db/schema'
import { TemplateSchema } from '@/stores/templatestore'
import { format } from 'date-fns'
import { desc, eq, or, sql } from 'drizzle-orm'
import { Logger } from 'next-axiom'

const logger = new Logger({
  source: 'actions/db/admin-queries'
})

const REVALIDATE_PERIOD = 300 // 5 minutes in seconds

export const isAdmin = cache(async (userId: string): Promise<boolean> => {
  if (!userId) return false
  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    columns: { role: true }
  })

  return dbUser?.role === 'admin'
})

export const authenticateAdmin = cache(async (): Promise<void> => {
  const { user } = await getUser()
  if (!user) {
    logger.error('Attempted to access admin function for unauthenticated user')
    await logger.flush()
    throw new Error('Unauthorized: User not authenticated')
  }

  const admin = await isAdmin(user.id)

  if (!admin) {
    logger.error('Attempted to access admin function for non-admin user')
    await logger.flush()
    throw new Error('Forbidden: User is not an admin')
  }
})

export const getFeedback = async () => {
  await authenticateAdmin()
  const feedback = await db.query.feedback.findMany()
  return feedback
}

export const getRenderHistory = async (
  page: number = 1,
  pageSize: number = 10,
  filter: string = ''
) => {
  await authenticateAdmin()
  const offset = (page - 1) * pageSize

  const renderHistory = await db
    .select({
      id: pastRenders.id,
      userId: pastRenders.userId,
      videoUrl: pastRenders.videoUrl,
      templateName: pastRenders.templateName,
      createdAt: pastRenders.createdAt
    })
    .from(pastRenders)
    .leftJoin(users, eq(pastRenders.userId, users.id))
    .where(
      filter
        ? sql`${pastRenders.templateName} ILIKE ${`%${filter}%`}`
        : undefined
    )
    .orderBy(desc(pastRenders.createdAt))
    .limit(pageSize)
    .offset(offset)

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(pastRenders)
    .where(
      filter
        ? sql`${pastRenders.templateName} ILIKE ${`%${filter}%`}`
        : undefined
    )

  const totalCount = totalCountResult[0].count

  return {
    renderHistory,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page
  }
}

export type RenderHistoryForAdmin = Awaited<
  ReturnType<typeof getRenderHistory>
>['renderHistory'][number]

export const getRenderById = async (id: string) => {
  await authenticateAdmin()
  const render = await db.query.pastRenders.findFirst({
    where: (pastRenders, { eq }) => eq(pastRenders.id, id)
  })
  return render
}

export const getUsersForAdmin = async (
  page: number = 1,
  pageSize: number = 10,
  filter: string = ''
) => {
  await authenticateAdmin()
  const offset = (page - 1) * pageSize

  const usersWithUsage = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: users.role,
      usage: {
        creditsLeft: userUsage.creditsLeft,
        connectedAccountsLeft: userUsage.connectedAccountsLeft
      }
    })
    .from(users)
    .leftJoin(userUsage, eq(users.id, userUsage.userId))
    .where(
      filter
        ? or(
            sql`${users.fullName} ILIKE ${`%${filter}%`}`,
            sql`${users.email} ILIKE ${`%${filter}%`}`
          )
        : undefined
    )
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset)

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(
      filter
        ? or(
            sql`${users.fullName} ILIKE ${`%${filter}%`}`,
            sql`${users.email} ILIKE ${`%${filter}%`}`
          )
        : undefined
    )

  const totalCount = totalCountResult[0].count

  return {
    users: usersWithUsage,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page
  }
}
export const getFeedbackForAdmin = async (
  page: number = 1,
  pageSize: number = 10,
  filter: string = ''
) => {
  await authenticateAdmin()
  const offset = (page - 1) * pageSize

  const feedbackWithUser = await db
    .select({
      id: feedback.id,
      userId: feedback.userId,
      feedbackType: feedback.feedbackType,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .where(filter ? sql`${feedback.comment} ILIKE ${`%${filter}%`}` : undefined)
    .orderBy(desc(feedback.createdAt))
    .limit(pageSize)
    .offset(offset)

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(feedback)
    .where(filter ? sql`${feedback.comment} ILIKE ${`%${filter}%`}` : undefined)

  const totalCount = totalCountResult[0].count

  return {
    feedback: feedbackWithUser,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page
  }
}

export type RenderHistory = typeof pastRenders.$inferSelect

export type UsersForAdmin = Awaited<
  ReturnType<typeof getUsersForAdmin>
>['users'][number]

export type FeedbackForAdmin = Awaited<
  ReturnType<typeof getFeedbackForAdmin>
>['feedback'][number]

const getUserCountRaw = async () => {
  await authenticateAdmin()
  const userCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
  return userCount[0].count
}

const getRenderCountRaw = async () => {
  await authenticateAdmin()
  const renderCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(pastRenders)
  return renderCount[0].count
}

const getFeedbackCountRaw = async () => {
  await authenticateAdmin()
  const feedbackCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(feedback)
  return feedbackCount[0].count
}

const getYoutubePostsCountRaw = async () => {
  await authenticateAdmin()
  const youtubePostsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(youtubePosts)
  return youtubePostsCount[0].count
}

const getTikTokPostsCountRaw = async () => {
  await authenticateAdmin()
  const tikTokPostsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(tiktokPosts)
  return tikTokPostsCount[0].count
}

const getTikTokAccountsCountRaw = async () => {
  await authenticateAdmin()
  const tikTokAccountsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(tiktokAccounts)
  return tikTokAccountsCount[0].count
}

const getYoutubeAccountsCountRaw = async () => {
  await authenticateAdmin()
  const youtubeAccountsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(youtubeChannels)
  return youtubeAccountsCount[0].count
}

const getRenderCountPerDayRaw = async (startDate: Date, endDate: Date) => {
  await authenticateAdmin()
  const renderCounts = await db
    .select({
      date: sql<string>`to_char(${pastRenders.createdAt}::date, 'YYYY-MM-DD')`,
      templateName: pastRenders.templateName,
      count: sql<number>`count(*)`
    })
    .from(pastRenders)
    .where(
      sql`${pastRenders.createdAt}::date >= ${startDate.toISOString()}::date AND ${pastRenders.createdAt}::date <= ${endDate.toISOString()}::date`
    )
    .groupBy(
      sql`to_char(${pastRenders.createdAt}::date, 'YYYY-MM-DD')`,
      pastRenders.templateName
    )
    .orderBy(sql`to_char(${pastRenders.createdAt}::date, 'YYYY-MM-DD')`)

  const templateNames = [...new Set(TemplateSchema.options)]
  const renderCountPerDay = renderCounts.reduce(
    (acc, { date, templateName, count }) => {
      if (!acc[date]) {
        acc[date] = {
          date,
          ...Object.fromEntries(templateNames.map((name) => [name, 0]))
        }
      }
      acc[date][templateName] = Number(count)
      return acc
    },
    {} as Record<string, Record<string, number | string>>
  )

  const result = Object.values(renderCountPerDay)
  return result
}

const getUserCountPerDayRaw = async (startDate: Date, endDate: Date) => {
  await authenticateAdmin()
  const userCountPerDay = await db
    .select({
      date: sql<string>`to_char(date_series.date, 'YYYY-MM-DD')`,
      count: sql<number>`COALESCE(count(${users.id}), 0)`
    })
    .from(
      sql`generate_series(${startDate.toISOString()}::date, ${endDate.toISOString()}::date, '1 day'::interval) AS date_series(date)`
    )
    .leftJoin(
      users,
      sql`date_trunc('day', ${users.createdAt}) = date_series.date`
    )
    .groupBy(sql`date_series.date`)
    .orderBy(sql`date_series.date`)
  return userCountPerDay
}

const getFeedbackCountPerDayRaw = async (startDate: Date, endDate: Date) => {
  await authenticateAdmin()
  const feedbackCountPerDay = await db
    .select({
      date: sql<string>`to_char(date_series.date, 'YYYY-MM-DD')`,
      count: sql<number>`COALESCE(count(${feedback.id}), 0)`
    })
    .from(
      sql`generate_series(${startDate.toISOString()}::date, ${endDate.toISOString()}::date, '1 day'::interval) AS date_series(date)`
    )
    .leftJoin(
      feedback,
      sql`date_trunc('day', ${feedback.createdAt}) = date_series.date`
    )
    .groupBy(sql`date_series.date`)
    .orderBy(sql`date_series.date`)
  return feedbackCountPerDay
}

const getTikTokPostsPerDayRaw = async (startDate: Date, endDate: Date) => {
  await authenticateAdmin()
  const tikTokPostsPerDay = await db
    .select({
      date: sql<string>`to_char(date_series.date, 'YYYY-MM-DD')`,
      count: sql<number>`COALESCE(count(${tiktokPosts.id}), 0)`
    })
    .from(
      sql`generate_series(${startDate.toISOString()}::date, ${endDate.toISOString()}::date, '1 day'::interval) AS date_series(date)`
    )
    .leftJoin(
      tiktokPosts,
      sql`date_trunc('day', ${tiktokPosts.createdAt}) = date_series.date`
    )
    .groupBy(sql`date_series.date`)
    .orderBy(sql`date_series.date`)
  return tikTokPostsPerDay
}

const getYoutubePostsPerDayRaw = async (startDate: Date, endDate: Date) => {
  await authenticateAdmin()
  const youtubePostsPerDay = await db
    .select({
      date: sql<string>`to_char(date_series.date, 'YYYY-MM-DD')`,
      count: sql<number>`COALESCE(count(${youtubePosts.id}), 0)`
    })
    .from(
      sql`generate_series(${startDate.toISOString()}::date, ${endDate.toISOString()}::date, '1 day'::interval) AS date_series(date)`
    )
    .leftJoin(
      youtubePosts,
      sql`date_trunc('day', ${youtubePosts.createdAt}) = date_series.date`
    )
    .groupBy(sql`date_series.date`)
    .orderBy(sql`date_series.date`)
  return youtubePostsPerDay
}

const getMostRecentRendersRaw = async () => {
  await authenticateAdmin()
  const mostRecentRenders = await db
    .select()
    .from(pastRenders)
    .orderBy(desc(pastRenders.createdAt))
    .limit(10)
  return mostRecentRenders
}

export const getMostRecentRenders = unstable_cache(
  getMostRecentRendersRaw,
  ['most-recent-renders'],
  { revalidate: REVALIDATE_PERIOD }
)

export const getUserCount = unstable_cache(
  getUserCountRaw,
  ['user-count'],
  { revalidate: REVALIDATE_PERIOD } // 1 minute in seconds
)

export const getRenderCount = unstable_cache(
  getRenderCountRaw,
  ['render-count'],
  { revalidate: REVALIDATE_PERIOD }
)

export const getFeedbackCount = unstable_cache(
  getFeedbackCountRaw,
  ['feedback-count'],
  { revalidate: REVALIDATE_PERIOD }
)

export const getYoutubePostsCount = unstable_cache(
  getYoutubePostsCountRaw,
  ['youtube-posts-count'],
  { revalidate: REVALIDATE_PERIOD }
)

export const getTikTokPostsCount = unstable_cache(
  getTikTokPostsCountRaw,
  ['tiktok-posts-count'],
  { revalidate: REVALIDATE_PERIOD }
)

export const getTikTokAccountsCount = unstable_cache(
  getTikTokAccountsCountRaw,
  ['tiktok-accounts-count'],
  { revalidate: REVALIDATE_PERIOD }
)

export const getYoutubeAccountsCount = unstable_cache(
  getYoutubeAccountsCountRaw,
  ['youtube-accounts-count'],
  { revalidate: REVALIDATE_PERIOD }
)

export const getRenderCountPerDay = async (startDate: Date, endDate: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cacheOptions: { revalidate: number | false } =
    endDate < today ? { revalidate: false } : { revalidate: REVALIDATE_PERIOD }

  return unstable_cache(
    () => getRenderCountPerDayRaw(startDate, endDate),
    [
      `render-count-per-day-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`
    ],
    cacheOptions
  )()
}
export const getUserCountPerDay = (startDate: Date, endDate: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cacheOptions: { revalidate: number | false } =
    endDate < today ? { revalidate: false } : { revalidate: REVALIDATE_PERIOD }

  return unstable_cache(
    () => getUserCountPerDayRaw(startDate, endDate),
    [
      `user-count-per-day-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`
    ],
    cacheOptions
  )()
}

export const getFeedbackCountPerDay = (startDate: Date, endDate: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cacheOptions: { revalidate: number | false } =
    endDate < today ? { revalidate: false } : { revalidate: REVALIDATE_PERIOD }

  return unstable_cache(
    () => getFeedbackCountPerDayRaw(startDate, endDate),
    [
      `feedback-count-per-day-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`
    ],
    cacheOptions
  )()
}

export const getTikTokPostsPerDay = (startDate: Date, endDate: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cacheOptions: { revalidate: number | false } =
    endDate < today ? { revalidate: false } : { revalidate: REVALIDATE_PERIOD }

  return unstable_cache(
    () => getTikTokPostsPerDayRaw(startDate, endDate),
    [
      `tiktok-posts-per-day-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`
    ],
    cacheOptions
  )()
}

export const getYoutubePostsPerDay = (startDate: Date, endDate: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cacheOptions: { revalidate: number | false } =
    endDate < today ? { revalidate: false } : { revalidate: REVALIDATE_PERIOD }

  return unstable_cache(
    () => getYoutubePostsPerDayRaw(startDate, endDate),
    [
      `youtube-posts-per-day-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`
    ],
    cacheOptions
  )()
}

export async function getUserProfileForAdmin(
  userId: string,
  page: number = 1,
  pageSize: number = 10
) {
  await authenticateAdmin()

  const user = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: users.role,
      usage: {
        creditsLeft: userUsage.creditsLeft,
        connectedAccountsLeft: userUsage.connectedAccountsLeft
      },
      subscription: {
        id: subscriptions.id,
        priceId: subscriptions.priceId
      },
      stripeCustomerId: customers.stripeCustomerId
    })
    .from(users)
    .leftJoin(userUsage, eq(users.id, userUsage.userId))
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .leftJoin(customers, eq(users.id, customers.id))
    .where(eq(users.id, userId))
    .limit(1)

  if (!user[0]) {
    throw new Error('User not found')
  }

  const userRenders = await db
    .select({
      id: pastRenders.id,
      userId: pastRenders.userId,
      videoUrl: pastRenders.videoUrl,
      templateName: pastRenders.templateName,
      createdAt: pastRenders.createdAt
    })
    .from(pastRenders)
    .where(eq(pastRenders.userId, userId))
    .orderBy(desc(pastRenders.createdAt))
    .limit(10)

  const userFeedback = await db
    .select({
      id: feedback.id,
      userId: feedback.userId,
      feedbackType: feedback.feedbackType,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt
    })
    .from(feedback)
    .where(eq(feedback.userId, userId))
    .orderBy(desc(feedback.createdAt))
    .limit(10)

  return {
    user: user[0],
    renders: userRenders,
    feedback: userFeedback,
    totalPages: Math.ceil(userRenders.length / pageSize)
  }
}

export type UserProfileForAdmin = Awaited<
  ReturnType<typeof getUserProfileForAdmin>
>
