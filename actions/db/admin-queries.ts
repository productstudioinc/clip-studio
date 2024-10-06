import { getUser } from '@/actions/auth/user'
import { db } from '@/db'
import { feedback, pastRenders, users, userUsage } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { Logger } from 'next-axiom'

const logger = new Logger({
  source: 'actions/db/admin-queries'
})

export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    columns: { role: true }
  })

  return dbUser?.role === 'admin'
}

export const authenticateAdmin = async (): Promise<void> => {
  const { user } = await getUser()
  if (!user) {
    logger.error('Attempted to access admin function for unauthenticated user')
    await logger.flush()
    throw new Error('Unauthorized: User not authenticated')
  }

  const isAdmin = await checkAdminStatus(user.id)

  if (!isAdmin) {
    logger.error('Attempted to access admin function for non-admin user')
    await logger.flush()
    throw new Error('Forbidden: User is not an admin')
  }
}

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
    .select()
    .from(pastRenders)
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
      role: users.role,
      usage: {
        creditsLeft: userUsage.creditsLeft,
        connectedAccountsLeft: userUsage.connectedAccountsLeft
      }
    })
    .from(users)
    .leftJoin(userUsage, eq(users.id, userUsage.userId))
    .limit(pageSize)
    .offset(offset)

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)

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
      feedbackType: feedback.feedbackType,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
      user: {
        id: users.id,
        fullName: users.fullName
      }
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

export const getUserCount = async () => {
  await authenticateAdmin()
  const userCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
  return userCount[0].count
}

export const getRenderCount = async () => {
  await authenticateAdmin()
  const renderCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(pastRenders)
  return renderCount[0].count
}

export const getFeedbackCount = async () => {
  await authenticateAdmin()
  const feedbackCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(feedback)
  return feedbackCount[0].count
}

export const getRenderCountPerDay = async (startDate: Date, endDate: Date) => {
  await authenticateAdmin()

  const renderCountPerDay = await db
    .select({
      date: sql<string>`to_char(date_series.date, 'YYYY-MM-DD')`,
      count: sql<number>`COALESCE(count(${pastRenders.id}), 0)`
    })
    .from(
      sql`generate_series(${startDate.toISOString()}::date, ${endDate.toISOString()}::date, '1 day'::interval) AS date_series(date)`
    )
    .leftJoin(
      pastRenders,
      sql`date_trunc('day', ${pastRenders.createdAt}) = date_series.date`
    )
    .groupBy(sql`date_series.date`)
    .orderBy(sql`date_series.date`)

  return renderCountPerDay
}

export const getUserCountPerDay = async (startDate: Date, endDate: Date) => {
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

  console.log(userCountPerDay)
  return userCountPerDay
}
