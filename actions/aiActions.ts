'use server'

import { db } from '@/db'
import { userUsage } from '@/db/schema'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { eq, sql } from 'drizzle-orm'
import { Logger } from 'next-axiom'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

import { getUser } from './auth/user'

const logger = new Logger({
  source: 'actions/aiActions'
})

// Credit management functions
const checkAndDeductCredits = async (
  userId: string,
  requiredCredits: number
) => {
  return await db.transaction(async (tx) => {
    const userUsageRecord = await tx
      .select({ creditsLeft: userUsage.creditsLeft })
      .from(userUsage)
      .where(eq(userUsage.userId, userId))
      .for('update')

    if (userUsageRecord.length === 0 || !userUsageRecord[0].creditsLeft) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'You need an active subscription to use this feature.'
      )
    }

    if (userUsageRecord[0].creditsLeft < requiredCredits) {
      throw new ZSAError(
        'INSUFFICIENT_CREDITS',
        `You don't have enough credits to perform this action.`
      )
    }

    await tx
      .update(userUsage)
      .set({
        creditsLeft: sql`${userUsage.creditsLeft} - ${requiredCredits}`
      })
      .where(eq(userUsage.userId, userId))
  })
}

export const generateStoryScript = createServerAction()
  .input(
    z.object({
      type: z.enum(['AIImages', 'AIVideo']),
      prompt: z.string(),
      range: z.string(),
      segments: z.string()
    })
  )
  .handler(async ({ input }) => {
    const { prompt, range, segments } = input

    const { user } = await getUser()
    if (!user) {
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    const requiredCredits = CREDIT_CONVERSIONS.SCRIPT_GENERATION

    try {
      await checkAndDeductCredits(user.id, requiredCredits)

      const result = await generateObject({
        model: openai('gpt-4o-mini', {
          structuredOutputs: true
        }),
        schemaName: 'story',
        schemaDescription: 'Story segments with text and image descriptions',
        schema: z.object({
          segments: z.array(
            z.object({
              text: z.string(),
              imageDescription: z.string()
            })
          )
        }),
        prompt: `Create an engaging ${range} minute story with ${segments} segments based on this theme: ${prompt}

        For each segment, provide:
        1. Text: A 1-2 sentence narrative that advances the story
        2. Image Description: A 20-30 word description focusing on:
           - Main character's actions and expressions
           - Relevant setting details
           - Clear, specific visuals
           - Family-friendly content

        Guidelines:
        - Start with a strong hook
        - Create a clear narrative arc
        - End with an impactful conclusion
        - Keep descriptions vivid but concise
        - Ensure content is shareable and engaging`
      })

      logger.info('Story script generated successfully', {
        userId: user.id,
        promptLength: prompt.length,
        segmentsGenerated: result.object.segments.length
      })
      return result.object.segments
    } catch (error) {
      logger.error('Error in generateStoryScript', {
        error: error instanceof Error ? error.message : String(error),
        userId: user?.id
      })

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the story script.'
      )
    }
  })

export const generateRedditPost = createServerAction()
  .input(z.string())
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
    const { user } = await getUser()
    if (!user) {
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    const requiredCredits = CREDIT_CONVERSIONS.SCRIPT_GENERATION

    try {
      await checkAndDeductCredits(user.id, requiredCredits)

      const result = await generateObject({
        model: openai('gpt-4o-mini', {
          structuredOutputs: true
        }),
        schemaName: 'reddit_story',
        schemaDescription: 'A reddit story.',
        schema: z.object({
          title: z.string(),
          subreddit: z.string(),
          accountName: z.string(),
          text: z.string(),
          likes: z.number(),
          comments: z.number()
        }),
        prompt: `
        Generate a spicy reddit story. Make the title hook the reader in. Make the story interesting and engaging. 

        Rules:
        - The story must be 250 words or less.
        - The story must be in the style of a reddit post.
        - The subreddit should not have a "r/" prefix.
        - Likes and comments should be viral numbers.
        - Don't include a TLDR.
        
        Additional context: 
        ${input}
        `
      })

      logger.info('Reddit post generated successfully', {
        userId: user.id,
        promptLength: input.length
      })
      return result.object
    } catch (error) {
      logger.error('Error in generateRedditPost', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id
      })

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the Reddit post.'
      )
    }
  })

export const generateTextMessages = createServerAction()
  .input(z.string())
  .output(
    z.object({
      senderName: z.string(),
      receiverName: z.string(),
      messages: z.array(z.any())
    })
  )
  .handler(async ({ input }) => {
    const { user } = await getUser()

    if (!user) {
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    try {
      await checkAndDeductCredits(user.id, CREDIT_CONVERSIONS.SCRIPT_GENERATION)

      const result = await generateObject({
        model: openai('gpt-4o-mini', {
          structuredOutputs: true
        }),
        schemaName: 'text_messages',
        schemaDescription: 'A text message conversation between two people.',
        schema: z.object({
          senderName: z.string(),
          receiverName: z.string(),
          messages: z.array(
            z.object({
              sender: z.enum(['sender', 'receiver']),
              content: z.object({
                type: z.literal('text'),
                value: z.string()
              }),
              duration: z.number(),
              from: z.number()
            })
          )
        }),
        prompt: `
        Generate a spicy text message conversation between two people. Something that would hook the reader in.

        Rules:
        - Each message should be relatively short (under 100 characters)
        - Make the conversation realistic.
        - Make it Gen Z.
        
        Context for the conversation:
        ${input}
        `
      })

      logger.info('Text messages generated successfully', {
        userId: user.id,
        promptLength: input.length
      })

      return result.object
    } catch (error) {
      logger.error('Error in generateTextMessages', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id
      })

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the text messages.'
      )
    }
  })

export const generateTweets = createServerAction()
  .input(z.string())
  .output(
    z.object({
      tweets: z.array(
        z.object({
          username: z.string(),
          name: z.string(),
          content: z.string(),
          image: z.string(),
          verified: z.boolean(),
          likes: z.number(),
          comments: z.number()
        })
      )
    })
  )
  .handler(async ({ input }) => {
    const { user } = await getUser()
    if (!user) {
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    try {
      await checkAndDeductCredits(user.id, CREDIT_CONVERSIONS.SCRIPT_GENERATION)

      const result = await generateObject({
        model: openai('gpt-4o-mini', {
          structuredOutputs: true
        }),
        schemaName: 'tweets',
        schemaDescription: 'A series of tweets in a thread format.',
        schema: z.object({
          tweets: z.array(
            z.object({
              username: z.string(),
              name: z.string(),
              content: z.string(),
              image: z.string(),
              verified: z.boolean(),
              likes: z.number(),
              comments: z.number()
            })
          )
        }),
        prompt: `
        Generate a viral tweet thread that would get a lot of engagement. Each subsequent tweet should be a reply to the previous tweet.

        Rules:
        - Each tweet should be under 280 characters
        - Extremely rarely use hashtags
        - Generate 2-5 tweets
        - no @ in username
        
        Context for the tweets:
        ${input}
        `
      })

      logger.info('Tweets generated successfully', {
        userId: user.id,
        promptLength: input.length
      })

      return result.object
    } catch (error) {
      logger.error('Error in generateTweets', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id
      })

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the tweets.'
      )
    }
  })

export const generateHopeCoreStory = createServerAction()
  .input(z.string())
  .output(
    z.object({
      story: z.string()
    })
  )
  .handler(async ({ input }) => {
    const { user } = await getUser()

    if (!user) {
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    try {
      await checkAndDeductCredits(user.id, CREDIT_CONVERSIONS.SCRIPT_GENERATION)

      const result = await generateObject({
        model: openai('gpt-4o', {
          structuredOutputs: true
        }),
        schemaName: 'hopecore_story',
        schemaDescription: 'A hopecore story.',
        schema: z.object({
          story: z.string()
        }),
        prompt: `
        Generate a single 20-80 word passage by a Romantic author which is relatable and understandable in current day. Examples of some but not all Romantic authors include:
        - Jane Austen
        - Lord Byron
        - William Wordsworth
        - John Keats
        - William Blake
        - Mary Shelley

        Rules:
        - no #, @ or quotes
        - Should be third person
        
        Context for the passage:
        ${input}
        `
      })

      logger.info('HopeCore story generated successfully', {
        userId: user.id,
        promptLength: input.length
      })

      return result.object
    } catch (error) {
      logger.error('Error in generateHopeCoreStory', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id
      })

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the hopecore story.'
      )
    }
  })
