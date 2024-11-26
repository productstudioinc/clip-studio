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
        schemaDescription:
          'A story object containing an array of segments, each with text and an image description',
        schema: z.object({
          segments: z.array(
            z.object({
              text: z.string(),
              imageDescription: z.string()
            })
          )
        }),
        prompt: `
        You are tasked with generating a story for a video that has the potential to go viral and keep users engaged. The story will consist of multiple segments, each containing a short text description (1-2 sentences) and a corresponding image description. Your goal is to create content that is captivating, shareable, and tailored to the target audience.

        Guidelines for creating engaging content:
        - Keep each segment concise and impactful
        - Use emotional triggers (e.g., surprise, joy, curiosity)
        - Incorporate relatable situations or characters
        - Create a narrative arc with a clear beginning, middle, and end across all segments
        - Use vivid language to paint a picture in the viewer's mind

        The story should be 3-4 minutes long. Use the following guidelines for the number of segments:
        - Short story (1-2 minutes): 6-7 segments
        - Medium story (3-4 minutes): 12-14 segments
        - Long story (5-7 minutes): 18-21 segments

        For this ${range} minute story, you should create approximately ${segments} segments.

        The theme of the story is ${prompt}.

        Incorporate these inputs into your story as follows:
        1. Ensure the story aligns with the given theme
        2. Tailor the content to appeal to the target audience
        3. Structure the story to fit within the specified duration of ${range} minutes by creating ${segments} segments

        When crafting the text descriptions:
        - Start with a hook to grab the viewer's attention in the first segment
        - Use short, punchy sentences for easy reading
        - Include dialogue or inner thoughts to add depth
        - End with a twist or satisfying conclusion in the final segment

        For the image descriptions:
        - Focus primarily on the characters and their actions in each scene
        - Describe the character's appearance, expression, and body language in detail
        - Clearly state what action or activity the character is performing
        - Include the full names of key characters in every relevant description
        - Provide context about the setting or environment, but keep it secondary to the character's actions
        - Ensure each description clearly connects to the overall narrative theme
        - Use 20-30 words to capture all necessary details while remaining concise
        - Avoid any references to previous segments or ongoing narrative
        - Use clear, specific language to convey the main image concept
        - Strictly avoid content that could violate social media terms of service
        - Keep all content family-friendly and suitable for a general audience

        Example:
        Instead of: "A diverse group of people stand together in a park, holding hands and smiling."
        Write: "Dr. Martin Luther King Jr., with a determined expression, raises his right hand in a powerful gesture while addressing a diverse crowd. His passionate stance conveys leadership and inspiration in the 1960s civil rights movement."

        Remember to focus on viral potential:
        - Include elements that encourage sharing (e.g., relatable content, humor, inspiration)
        - Create a sense of urgency or FOMO (Fear Of Missing Out)
        - Leave room for viewer interpretation or engagement

        Ensure that both the text and image descriptions work together to create a cohesive and engaging story that has the potential to go viral on social media. Each segment should flow naturally into the next, creating a seamless narrative experience for a ${range} minute video with ${segments} segments.`
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
