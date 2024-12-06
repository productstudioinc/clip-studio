'use server'

import { getUser } from '@/actions/auth/user'
import { db } from '@/db'
import { userOnboarding, userOnboardingResponses } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Logger } from 'next-axiom'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

const logger = new Logger({
  source: 'actions/db/onboarding-queries'
})

export const getUserOnboardingStatus = async () => {
  const { user } = await getUser()
  if (!user) {
    logger.warn('Attempted to get onboarding status for unauthenticated user')
    await logger.flush()
    return null
  }

  logger.info('Fetching user onboarding status', { userId: user.id })
  try {
    const onboardingStatus = await db.query.userOnboarding.findFirst({
      where: eq(userOnboarding.userId, user.id)
    })

    const onboardingResponses =
      await db.query.userOnboardingResponses.findFirst({
        where: eq(userOnboardingResponses.userId, user.id)
      })

    if (!onboardingStatus) {
      return null
    }

    return {
      ...onboardingStatus,
      responses: onboardingResponses
    }
  } catch (error) {
    logger.error('Error fetching user onboarding status', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    throw error
  }
}

export const updateOnboardingStatus = createServerAction()
  .input(
    z.object({
      hasGeneratedVideo: z.boolean(),
      videoGeneratedAt: z.date().optional()
    })
  )
  .handler(async ({ input }) => {
    const { user } = await getUser()
    if (!user) {
      logger.warn(
        'Attempted to update onboarding status for unauthenticated user'
      )
      await logger.flush()
      throw new ZSAError(
        'NOT_AUTHORIZED',
        'You must be logged in to update onboarding status.'
      )
    }

    logger.info('Updating onboarding status', { userId: user.id })
    try {
      const now = new Date()
      await db
        .insert(userOnboarding)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          hasGeneratedVideo: input.hasGeneratedVideo,
          videoGeneratedAt: input.videoGeneratedAt || now,
          createdAt: now,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: userOnboarding.id,
          set: {
            hasGeneratedVideo: input.hasGeneratedVideo,
            videoGeneratedAt: input.videoGeneratedAt || now,
            updatedAt: now
          }
        })

      logger.info('Onboarding status updated successfully', { userId: user.id })
      await logger.flush()
    } catch (error) {
      logger.error('Error updating onboarding status', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      })
      console.error('Error updating onboarding status', error)
      await logger.flush()
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to update onboarding status'
      )
    }
  })

export const updateOnboardingResponses = createServerAction()
  .input(
    z.object({
      referralSource: z.string().optional(),
      occupation: z.string().optional(),
      role: z.string().optional(),
      primaryGoal: z.string().optional(),
      useCase: z.string().optional(),
      teamSize: z.number().optional(),
      additionalContext: z.string().optional()
    })
  )
  .handler(async ({ input }) => {
    const { user } = await getUser()
    if (!user) {
      logger.warn(
        'Attempted to update onboarding responses for unauthenticated user'
      )
      await logger.flush()
      throw new ZSAError(
        'NOT_AUTHORIZED',
        'You must be logged in to update onboarding responses.'
      )
    }

    logger.info('Updating onboarding responses', { userId: user.id })
    try {
      const now = new Date()
      await db
        .insert(userOnboardingResponses)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          ...input,
          createdAt: now,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: userOnboardingResponses.id,
          set: {
            ...input,
            updatedAt: now
          }
        })

      logger.info('Onboarding responses updated successfully', {
        userId: user.id
      })
      await logger.flush()
    } catch (error) {
      logger.error('Error updating onboarding responses', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to update onboarding responses'
      )
    }
  })

export type GetUserOnboardingStatusResult = Awaited<
  ReturnType<typeof getUserOnboardingStatus>
>
