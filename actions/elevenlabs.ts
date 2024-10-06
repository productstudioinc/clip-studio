'use server'

import { db } from '@/db'
import { userUsage } from '@/db/schema'
import { TextMessageVideoSchema, VIDEO_FPS } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { errorString, startingFunctionString } from '@/utils/logging'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq, sql } from 'drizzle-orm'
import { ElevenLabsClient } from 'elevenlabs'
import { Logger } from 'next-axiom'
import z from 'zod'
import { createServerAction, ZSAError } from 'zsa'

import { R2 } from '../utils/r2'
import { getUser } from './auth/user'

const logger = new Logger({
  source: 'actions/elevenlabs'
})

const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY!
})

export const getVoices = async () => {
  try {
    const voices = await elevenLabsClient.voices.getAll()
    const filteredVoices = voices.voices.slice(0, 10).map((voice) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      description: voice.description,
      samples: voice.samples,
      labels: voice.labels,
      preview_url: voice.preview_url
    }))
    return filteredVoices
  } catch (error) {
    logger.error('Error fetching voices from ElevenLabs', {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    throw error
  }
}

export const generateRedditVoiceover = createServerAction()
  .input(
    z.object({
      title: z.string(),
      text: z.string(),
      voiceId: z.string(),
      language: z.string()
    })
  )
  .handler(async ({ input }) => {
    const logger = new Logger().with({
      function: 'generateRedditVoiceover',
      ...input
    })
    logger.info(startingFunctionString)

    const { user } = await getUser()
    if (!user) {
      logger.error(errorString, { error: 'User not authorized' })
      await logger.flush()
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    const fullText = `${input.title} <break time="0.7s" /> ${input.text}`
    const characterCount = fullText.length
    const requiredCredits = Math.ceil(
      characterCount / CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
    )

    try {
      const userUsageRecord = await db
        .select({ creditsLeft: userUsage.creditsLeft })
        .from(userUsage)
        .where(eq(userUsage.userId, user.id))

      if (userUsageRecord.length === 0 || !userUsageRecord[0].creditsLeft) {
        logger.error(errorString, {
          error: 'User does not have a subscription'
        })
        await logger.flush()
        throw new ZSAError(
          'INTERNAL_SERVER_ERROR',
          'You need an active subscription to use this feature.'
        )
      }

      if (userUsageRecord[0].creditsLeft < requiredCredits) {
        logger.error(errorString, { error: 'Insufficient credits' })
        await logger.flush()
        throw new ZSAError(
          'INSUFFICIENT_CREDITS',
          `You don't have enough credits to generate this voiceover.`
        )
      }

      // Deduct the credits
      await db
        .update(userUsage)
        .set({
          creditsLeft: sql`${userUsage.creditsLeft} - ${requiredCredits}`
        })
        .where(eq(userUsage.userId, user.id))

      const audio = (await elevenLabsClient.textToSpeech.convertWithTimestamps(
        input.voiceId,
        {
          model_id: 'eleven_turbo_v2_5',
          text: fullText,
          language_code: input.language
        }
      )) as AudioResponse

      const audioBuffer = Buffer.from(audio.audio_base64, 'base64')
      const s3Key = `voiceovers/${input.voiceId}/${crypto.randomUUID()}.mp3`

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
        Key: s3Key,
        Body: audioBuffer,
        ContentType: 'audio/mpeg'
      })

      await R2.send(putObjectCommand)

      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
        Key: s3Key
      })

      const signedUrl = await getSignedUrl(R2, getObjectCommand, {
        expiresIn: 3600
      })

      const normalizedTitle = input.title.toLowerCase()
      const normalizedCharacters = audio.normalized_alignment.characters.map(
        (char) => char.toLowerCase()
      )

      let titleEndIndex = -1
      for (
        let i = 0;
        i <= normalizedCharacters.length - normalizedTitle.length;
        i++
      ) {
        if (
          normalizedCharacters.slice(i, i + normalizedTitle.length).join('') ===
          normalizedTitle
        ) {
          titleEndIndex = i + normalizedTitle.length - 1
          break
        }
      }

      let actualTitleEndIndex = titleEndIndex
      while (
        actualTitleEndIndex < normalizedCharacters.length &&
        normalizedCharacters[actualTitleEndIndex] !== ' '
      ) {
        actualTitleEndIndex++
      }

      while (
        actualTitleEndIndex < normalizedCharacters.length &&
        normalizedCharacters[actualTitleEndIndex] === ' '
      ) {
        actualTitleEndIndex++
      }

      const titleEnd =
        actualTitleEndIndex >= 0
          ? audio.normalized_alignment.character_end_times_seconds[
              actualTitleEndIndex
            ]
          : 0

      logger.info('Voiceover generated successfully', {
        signedUrl,
        endTimestamp:
          audio.normalized_alignment.character_end_times_seconds.slice(-1)[0],
        voiceoverObject: audio.normalized_alignment,
        titleEnd
      })
      await logger.flush()
      return {
        signedUrl,
        endTimestamp:
          audio.normalized_alignment.character_end_times_seconds.slice(-1)[0],
        voiceoverObject: audio.normalized_alignment,
        titleEnd
      }
    } catch (error) {
      // If an error occurred, refund the credits
      await db
        .update(userUsage)
        .set({
          creditsLeft: sql`${userUsage.creditsLeft} + ${requiredCredits}`
        })
        .where(eq(userUsage.userId, user.id))

      logger.error(errorString, { error })

      // rethrow zsa errors if they bubble up
      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the voiceover.'
      )
    }
  })

export const generateTextVoiceover = createServerAction()
  .input(
    z.object({
      senderVoiceId: z.string(),
      receiverVoiceId: z.string(),
      messages: TextMessageVideoSchema.shape.messages
    })
  )
  .handler(async ({ input }) => {
    const logger = new Logger().with({
      function: 'generateTextVoiceover',
      ...input
    })
    logger.info(startingFunctionString)

    const { user } = await getUser()
    if (!user) {
      logger.error(errorString, { error: 'User not authorized' })
      await logger.flush()
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    const { senderVoiceId, receiverVoiceId, messages } = input

    const fullText = messages
      .filter((message) => message.content.type === 'text')
      .map((message) => message.content.value as string)
      .join(' <break time="0.3s" /> ')

    const characterCount = fullText.length
    const requiredCredits = Math.ceil(
      characterCount / CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
    )

    try {
      const userUsageRecord = await db
        .select({ creditsLeft: userUsage.creditsLeft })
        .from(userUsage)
        .where(eq(userUsage.userId, user.id))

      if (userUsageRecord.length === 0 || !userUsageRecord[0].creditsLeft) {
        logger.error(errorString, {
          error: 'User does not have a subscription'
        })
        await logger.flush()
        throw new ZSAError(
          'INTERNAL_SERVER_ERROR',
          'You need an active subscription to use this feature.'
        )
      }

      if (userUsageRecord[0].creditsLeft < requiredCredits) {
        logger.error(errorString, { error: 'Insufficient credits' })
        await logger.flush()
        throw new ZSAError(
          'INSUFFICIENT_CREDITS',
          `You don't have enough credits to generate this voiceover.`
        )
      }

      await db
        .update(userUsage)
        .set({
          creditsLeft: sql`${userUsage.creditsLeft} - ${requiredCredits}`
        })
        .where(eq(userUsage.userId, user.id))

      const audioBuffers: Buffer[] = []
      const sections: Array<{ from: number; duration: number }> = []

      let currentTime = 0

      for (const message of messages) {
        const voiceId =
          message.sender === 'sender' ? senderVoiceId : receiverVoiceId

        if (message.content.type === 'text') {
          const messageText = message.content.value as string

          // Add the message and a break after it
          const fullMessageText = `${messageText} <break time="0.3s" />`

          const audioResponse =
            (await elevenLabsClient.textToSpeech.convertWithTimestamps(
              voiceId,
              {
                model_id: 'eleven_turbo_v2_5',
                text: fullMessageText,
                language_code: 'en'
              }
            )) as AudioResponse

          const audioBuffer = Buffer.from(audioResponse.audio_base64, 'base64')
          audioBuffers.push(audioBuffer)

          // Get the actual duration of the message (use the last timestamp for duration)
          const endTimestamp =
            audioResponse.normalized_alignment.character_end_times_seconds.slice(
              -1
            )[0]
          const duration = endTimestamp // Duration of the message is directly the end timestamp

          sections.push({ from: currentTime, duration })

          // Update the current time to the end of this message for the next message
          currentTime += duration
        }
      }

      // Calculate the total duration by summing up all durations from the sections
      const totalDuration = sections.reduce(
        (sum, section) => sum + section.duration,
        0
      )

      const durationInFrames = Math.floor(totalDuration * VIDEO_FPS)

      const combinedAudioBuffer = Buffer.concat(audioBuffers)

      const s3Key = `voiceovers/combined/${crypto.randomUUID()}.mp3`
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
        Key: s3Key,
        Body: combinedAudioBuffer,
        ContentType: 'audio/mpeg'
      })

      await R2.send(putObjectCommand)

      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
        Key: s3Key
      })

      const signedUrl = await getSignedUrl(R2, getObjectCommand, {
        expiresIn: 3600
      })

      logger.info('Combined voiceover generated successfully', { signedUrl })
      await logger.flush()

      console.log({
        signedUrl,
        sections,
        durationInFrames
      })

      return {
        signedUrl,
        sections,
        durationInFrames
      }
    } catch (error) {
      await db
        .update(userUsage)
        .set({
          creditsLeft: sql`${userUsage.creditsLeft} + ${requiredCredits}`
        })
        .where(eq(userUsage.userId, user.id))

      logger.error(errorString, { error })
      await logger.flush()

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the voiceover.'
      )
    }
  })

export type ElevenlabsVoice = Awaited<ReturnType<typeof getVoices>>[number]

type AudioResponse = {
  audio_base64: string
  alignment: Alignment
  normalized_alignment: Alignment
}

type Alignment = {
  characters: string[]
  character_start_times_seconds: number[]
  character_end_times_seconds: number[]
}
