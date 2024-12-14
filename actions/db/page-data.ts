'use server'

import { cache } from 'react'
import { revalidateTag, unstable_cache } from 'next/cache'
import { getUser } from '@/actions/auth/user'
import { db } from '@/db'
import { music, templates, userUploads } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import { Logger } from 'next-axiom'

const logger = new Logger({
  source: 'actions/db/page-data'
})

const getCachedTemplates = unstable_cache(
  async () => {
    try {
      const response = await db
        .select()
        .from(templates)
        .where(
          process.env.NODE_ENV === 'production'
            ? eq(templates.active, true)
            : undefined
        )
        .orderBy(asc(templates.id))
      return response
    } catch (error) {
      logger.error('Error fetching templates', {
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw error
    }
  },
  ['templates'],
  { revalidate: 86400 }
)

const getCachedMusic = unstable_cache(
  async () => {
    try {
      const response = await db.select().from(music)
      return response
    } catch (error) {
      logger.error('Error fetching music', {
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw error
    }
  },
  ['music'],
  { revalidate: 86400 }
)

const getCachedBackgrounds = unstable_cache(
  async () => {
    try {
      const result = await db.query.backgrounds.findMany({
        with: {
          backgroundParts: true
        }
      })
      return result
    } catch (error) {
      logger.error('Error fetching backgrounds', {
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw error
    }
  },
  ['backgrounds'],
  { revalidate: 86400 }
)

export const getTemplates = getCachedTemplates

export const getBackgrounds = getCachedBackgrounds

export const getMusic = getCachedMusic

export const revalidateCache = (tag: string) => revalidateTag(tag)

export const getUserUploads = cache(async () => {
  try {
    const { user } = await getUser()
    if (!user) {
      return []
    }

    const response = await db.query.userUploads.findMany({
      where: eq(userUploads.userId, user.id),
      orderBy: (userUploads, { desc }) => [desc(userUploads.createdAt)]
    })

    return response
  } catch (error) {
    logger.error('Error fetching user uploads', {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    return []
  }
})
