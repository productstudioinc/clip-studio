'use server'

import { unstable_cache } from 'next/cache'
import { db } from '@/db'
import { userUsage } from '@/db/schema'
import {
  AIVideoSchema,
  Language,
  TextMessageVideoSchema,
  VIDEO_FPS
} from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { errorString, startingFunctionString } from '@/utils/logging'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq, sql } from 'drizzle-orm'
import { ElevenLabsClient } from 'elevenlabs'
import { Logger } from 'next-axiom'
import z from 'zod'
import { createServerAction, createServerActionProcedure, ZSAError } from 'zsa'

import { R2 } from '../utils/r2'
import { getUser } from './auth/user'

// Types
interface AudioResponse {
  audio_base64: string
  alignment: Alignment
  normalized_alignment: Alignment
}

interface Alignment {
  characters: string[]
  character_start_times_seconds: number[]
  character_end_times_seconds: number[]
}

interface WordTimestamp {
  text: string
  startMs: number
  endMs: number
  timestampMs: null
  confidence: null
}

export type ElevenlabsVoice = Awaited<ReturnType<typeof getVoices>>[number]
export type ElevenlabsLibraryVoice = Awaited<
  ReturnType<typeof getLibraryVoices>
>[number]

const logger = new Logger({ source: 'actions/elevenlabs' })
const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY!
})

const authedProcedure = createServerActionProcedure().handler(async () => {
  const { user } = await getUser()
  if (!user) {
    throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
  }
  return { user }
})

const creditsProcedure = createServerActionProcedure(authedProcedure)
  .input(
    z.union([
      z.object({
        tweets: z.array(
          z.object({
            username: z.string(),
            content: z.string()
          })
        )
      }),
      z.object({
        messages: TextMessageVideoSchema.shape.messages
      }),
      z.object({
        videoStructure: AIVideoSchema.shape.videoStructure
      }),
      z.object({
        title: z.string(),
        text: z.string()
      })
    ])
  )
  .handler(async ({ ctx, input }) => {
    const totalCharacters = (() => {
      switch (true) {
        case 'tweets' in input:
          return input.tweets.map((tweet) => tweet.content).join(' ').length

        case 'messages' in input:
          return input.messages
            .filter((msg) => msg.content.type === 'text')
            .map((msg) => msg.content.value as string)
            .join(' ').length

        case 'videoStructure' in input:
          return input.videoStructure.map((section) => section.text).join(' ')
            .length

        case 'title' in input && 'text' in input:
          return (input.title + ' ' + input.text).length

        default:
          return 0
      }
    })()

    const requiredCredits = Math.ceil(
      totalCharacters / CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
    )

    await db.transaction(async (tx) => {
      const userUsageRecord = await tx
        .select({ creditsLeft: userUsage.creditsLeft })
        .from(userUsage)
        .where(eq(userUsage.userId, ctx.user.id))
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
          `You don't have enough credits to generate this voiceover.`
        )
      }

      await tx
        .update(userUsage)
        .set({
          creditsLeft: sql`${userUsage.creditsLeft} - ${requiredCredits}`
        })
        .where(eq(userUsage.userId, ctx.user.id))
    })

    return { user: ctx.user }
  })

async function uploadToS3AndGetUrl(
  audioBuffer: Buffer,
  prefix: string
): Promise<string> {
  const s3Key = `voiceovers/${prefix}/${crypto.randomUUID()}.mp3`

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

  return getSignedUrl(R2, getObjectCommand, { expiresIn: 3600 })
}

function calculateWordTimestamps(
  alignment: Alignment,
  titleDuration: number = 0
): WordTimestamp[] {
  const words: string[] = []
  const wordStartTimes: number[] = []
  const wordEndTimes: number[] = []

  let currentWord = ''
  let currentWordStartTime: number | null = null

  alignment.characters.forEach((char, index) => {
    if (currentWordStartTime === null) {
      currentWordStartTime = alignment.character_start_times_seconds[index]
    }

    currentWord += char

    if (char === ' ' || index === alignment.characters.length - 1) {
      if (currentWord.trim() !== '') {
        const cleanedWord = ' ' + currentWord.trim().replace(/[^\w\s]/g, '')
        words.push(cleanedWord)
        wordStartTimes.push(currentWordStartTime!)
        wordEndTimes.push(alignment.character_end_times_seconds[index])
      }
      currentWord = ''
      currentWordStartTime = null
    }
  })

  return words.map((word, index) => ({
    text: word,
    startMs: wordStartTimes[index] * 1000 + titleDuration * 1000,
    endMs: wordEndTimes[index] * 1000 + titleDuration * 1000,
    timestampMs: null,
    confidence: null
  }))
}

async function generateAudioWithTimestamps(
  voiceId: string,
  text: string
): Promise<AudioResponse> {
  return elevenLabsClient.textToSpeech.convertWithTimestamps(voiceId, {
    model_id: 'eleven_multilingual_v2',
    text
  }) as Promise<AudioResponse>
}

export const getVoices = unstable_cache(async () => {
  try {
    const voices = await elevenLabsClient.voices.getAll()
    return voices.voices.map((voice) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      description: voice.description,
      samples: voice.samples,
      labels: voice.labels,
      preview_url: voice.preview_url
    }))
  } catch (error) {
    logger.error('Error fetching voices from ElevenLabs', {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    throw error
  }
})

export const getVoice = createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return elevenLabsClient.voices.get(input.id)
  })

export const getLibraryVoices = createServerAction()
  .input(
    z.object({
      search: z.string().optional(),
      page_size: z.number().optional().default(30),
      category: z.string().optional(),
      gender: z.string().optional(),
      age: z.string().optional(),
      accent: z.string().optional(),
      language: z.string().optional(),
      search_terms: z.string().optional(),
      use_cases: z.array(z.string()).optional(),
      descriptions: z.array(z.string()).optional(),
      featured: z.boolean().optional().default(false),
      ready_app_enabled: z.boolean().optional().default(false),
      owner_id: z.string().optional(),
      sort: z.string().optional(),
      page: z.number().optional()
    })
  )
  .handler(async ({ input }) => {
    logger.info(startingFunctionString, {
      function: 'getLibraryVoices',
      ...input
    })

    try {
      return await elevenLabsClient.voices.getShared(input)
    } catch (error) {
      logger.error('Error fetching voices from ElevenLabs', {
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while fetching library voices.'
      )
    }
  })

export const generateRedditVoiceover = creditsProcedure
  .createServerAction()
  .input(
    z.object({
      title: z.string(),
      text: z.string(),
      voiceId: z.string(),
      language: z.string()
    })
  )
  .handler(async ({ input }) => {
    logger.info(startingFunctionString, {
      function: 'generateRedditVoiceover',
      ...input
    })

    try {
      const [titleAudioResponse, textAudioResponse] = await Promise.all([
        generateAudioWithTimestamps(
          input.voiceId,
          input.title + ' <break time="0.4s" />'
        ),
        generateAudioWithTimestamps(input.voiceId, input.text)
      ])

      const titleAudioBuffer = Buffer.from(
        titleAudioResponse.audio_base64,
        'base64'
      )
      const textAudioBuffer = Buffer.from(
        textAudioResponse.audio_base64,
        'base64'
      )
      const combinedAudioBuffer = Buffer.concat([
        titleAudioBuffer,
        textAudioBuffer
      ])

      const titleDuration =
        titleAudioResponse.normalized_alignment.character_end_times_seconds.slice(
          -1
        )[0]
      const textDuration =
        textAudioResponse.normalized_alignment.character_end_times_seconds.slice(
          -1
        )[0]
      const totalDuration = titleDuration + textDuration

      const voiceoverObject = calculateWordTimestamps(
        textAudioResponse.normalized_alignment,
        titleDuration
      )

      const signedUrl = await uploadToS3AndGetUrl(
        combinedAudioBuffer,
        input.voiceId
      )

      return {
        signedUrl,
        voiceoverObject,
        endTimestamp: totalDuration
      }
    } catch (error) {
      logger.error(errorString, { error })
      await logger.flush()
      throw error instanceof ZSAError
        ? error
        : new ZSAError(
            'INTERNAL_SERVER_ERROR',
            'An error occurred while generating the voiceover.'
          )
    }
  })

export const generateTextVoiceover = creditsProcedure
  .createServerAction()
  .input(
    z.object({
      senderVoiceId: z.string(),
      receiverVoiceId: z.string(),
      messages: TextMessageVideoSchema.shape.messages,
      language: z.nativeEnum(Language)
    })
  )
  .handler(async ({ input }) => {
    logger.info(startingFunctionString, {
      function: 'generateTextVoiceover',
      ...input
    })

    try {
      const audioBuffers: Buffer[] = []
      const sections: Array<{ from: number; duration: number }> = []
      let currentTime = 0

      for (const message of input.messages) {
        if (message.content.type === 'text') {
          const voiceId =
            message.sender === 'sender'
              ? input.senderVoiceId
              : input.receiverVoiceId
          const messageText = `${message.content.value} <break time="0.3s" />`

          const audioResponse = await generateAudioWithTimestamps(
            voiceId,
            messageText
          )
          const audioBuffer = Buffer.from(audioResponse.audio_base64, 'base64')
          audioBuffers.push(audioBuffer)

          const duration =
            audioResponse.normalized_alignment.character_end_times_seconds.slice(
              -1
            )[0]
          sections.push({ from: currentTime, duration })
          currentTime += duration
        }
      }

      const totalDuration = sections.reduce(
        (sum, section) => sum + section.duration,
        0
      )
      const durationInFrames = Math.floor(totalDuration * VIDEO_FPS)
      const combinedAudioBuffer = Buffer.concat(audioBuffers)

      const signedUrl = await uploadToS3AndGetUrl(
        combinedAudioBuffer,
        'combined'
      )

      return {
        signedUrl,
        sections,
        durationInFrames
      }
    } catch (error) {
      logger.error(errorString, { error })
      await logger.flush()
      throw error instanceof ZSAError
        ? error
        : new ZSAError(
            'INTERNAL_SERVER_ERROR',
            'An error occurred while generating the voiceover.'
          )
    }
  })

export const generateStructuredVoiceover = creditsProcedure
  .createServerAction()
  .input(
    z.object({
      voiceId: AIVideoSchema.shape.voiceId,
      videoStructure: AIVideoSchema.shape.videoStructure,
      language: AIVideoSchema.shape.language
    })
  )
  .handler(async ({ input }) => {
    logger.info(startingFunctionString, {
      function: 'generateStructuredVoiceover',
      ...input
    })

    const fullText = input.videoStructure
      .map((section) => section.text)
      .join(' <break time="1s" /> ')

    try {
      const audio = await generateAudioWithTimestamps(input.voiceId, fullText)
      const audioBuffer = Buffer.from(audio.audio_base64, 'base64')

      const alignment = audio.normalized_alignment
      const totalDuration = alignment.character_end_times_seconds.slice(-1)[0]
      const voiceoverObject = calculateWordTimestamps(alignment)

      const segmentDurations = []
      let currentPosition = 0
      const breakMarker = ' <break time="1s" /> '

      for (let i = 0; i < input.videoStructure.length; i++) {
        const segment = input.videoStructure[i]
        const segmentText = segment.text

        const segmentStart = currentPosition / fullText.length
        currentPosition +=
          segmentText.length +
          (i < input.videoStructure.length - 1 ? breakMarker.length : 0)
        const segmentEnd = currentPosition / fullText.length

        segmentDurations.push(
          segmentEnd * totalDuration - segmentStart * totalDuration
        )
      }

      const signedUrl = await uploadToS3AndGetUrl(audioBuffer, input.voiceId)

      return {
        signedUrl,
        endTimestamp: totalDuration,
        voiceoverObject,
        segmentDurations
      }
    } catch (error) {
      logger.error(errorString, { error })
      await logger.flush()
      throw error instanceof ZSAError
        ? error
        : new ZSAError(
            'INTERNAL_SERVER_ERROR',
            'An error occurred while generating the voiceover.'
          )
    }
  })

export const generateTwitterVoiceover = creditsProcedure
  .createServerAction()
  .input(
    z.object({
      tweets: z.array(
        z.object({
          username: z.string(),
          content: z.string()
        })
      ),
      voiceSettings: z.array(
        z.object({
          username: z.string(),
          voiceId: z.string()
        })
      ),
      language: z.nativeEnum(Language)
    })
  )
  .handler(async ({ input }) => {
    logger.info(startingFunctionString, {
      function: 'generateTwitterVoiceover',
      ...input
    })

    try {
      const audioResults = []
      for (const tweet of input.tweets) {
        const voiceSetting = input.voiceSettings.find(
          (vs) => vs.username === tweet.username
        )
        if (!voiceSetting) continue

        const cleanContent = tweet.content
          .replace(/https?:\/\/\S+/g, '')
          .replace(/@\S+/g, '')
          .replace(/#\S+/g, '')
          .replace(/\s+/g, ' ')
          .trim()

        const tweetText = `${cleanContent}<break time="0.7s" />`

        try {
          const audioResponse = await generateAudioWithTimestamps(
            voiceSetting.voiceId,
            tweetText
          )

          audioResults.push({
            audio: Buffer.from(audioResponse.audio_base64, 'base64'),
            endTimestamp:
              audioResponse.normalized_alignment.character_end_times_seconds.slice(
                -1
              )[0]
          })
        } catch (error) {
          logger.error('Failed to generate audio for tweet', {
            username: tweet.username,
            error: error instanceof Error ? error.message : String(error)
          })
          throw error
        }
      }

      const audioBuffers = audioResults.map((result) => result.audio)
      const sections: Array<{ from: number; duration: number }> = []
      let currentTime = 0

      audioResults.forEach((result) => {
        sections.push({
          duration: result.endTimestamp,
          from: currentTime
        })
        currentTime += result.endTimestamp
      })

      const totalDuration = sections.reduce(
        (sum, section) => sum + section.duration,
        0
      )
      const durationInFrames = Math.floor(totalDuration * VIDEO_FPS)
      const combinedAudioBuffer = Buffer.concat(audioBuffers)

      const signedUrl = await uploadToS3AndGetUrl(
        combinedAudioBuffer,
        'twitter'
      )

      return {
        signedUrl,
        sections,
        durationInFrames
      }
    } catch (error) {
      logger.error(errorString, { error })
      await logger.flush()
      throw error instanceof ZSAError
        ? error
        : new ZSAError(
            'INTERNAL_SERVER_ERROR',
            'An error occurred while generating the voiceover.'
          )
    }
  })
