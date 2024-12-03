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
import { createServerAction, ZSAError } from 'zsa'

import { R2 } from '../utils/r2'
import { getUser } from './auth/user'

const logger = new Logger({
  source: 'actions/elevenlabs'
})

const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY!
})

export const getVoices = unstable_cache(async () => {
  try {
    const voices = await elevenLabsClient.voices.getAll()
    const filteredVoices = voices.voices.map((voice) => ({
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
})

export const getVoice = createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const voice = await elevenLabsClient.voices.get(input.id)
    return voice
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
    const logger = new Logger().with({
      function: 'getLibraryVoices',
      ...input
    })
    logger.info(startingFunctionString)

    try {
      const voices = await elevenLabsClient.voices.getShared(input)
      return voices
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

export const generateHopecoreVoiceover = createServerAction()
  .input(
    z.object({
      text: z.string(),
      voiceId: z.string(),
      language: z.string()
    })
  )
  .handler(async ({ input }) => {
    const logger = new Logger().with({
      function: 'generateHopecoreVoiceover',
      ...input
    })
    logger.info(startingFunctionString)

    const { user } = await getUser()
    if (!user) {
      logger.error(errorString, { error: 'User not authorized' })
      await logger.flush()
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    const { text, voiceId, language } = input

    const fullText = `${text} <break time="0.7s" />`

    // TODO: Implement voiceover generation
    // Must return remotion Caption type so that it can be used by this function
    // https://www.remotion.dev/docs/captions/create-tiktok-style-captions

    return {
      fullText
    }
  })

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

    const [titleAudioResponse, textAudioResponse] = await Promise.all([
      elevenLabsClient.textToSpeech.convertWithTimestamps(input.voiceId, {
        model_id: 'eleven_multilingual_v2',
        text: input.title + ' <break time="0.4s" />'
      }) as Promise<AudioResponse>,

      elevenLabsClient.textToSpeech.convertWithTimestamps(input.voiceId, {
        model_id: 'eleven_multilingual_v2',
        text: input.text
      }) as Promise<AudioResponse>
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

    const calculateWordTimestamps = (alignment: Alignment) => {
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

    const voiceoverObject = calculateWordTimestamps(
      textAudioResponse.normalized_alignment
    )

    const fs = require('fs')
    const path = require('path')
    await fs.promises.writeFile(
      path.join(process.cwd(), 'voiceover.json'),
      JSON.stringify(voiceoverObject, null, 2),
      'utf-8'
    )

    const s3Key = `voiceovers/${input.voiceId}/${crypto.randomUUID()}.mp3`
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
    console.log(signedUrl)
    console.log(totalDuration)
    return {
      signedUrl,
      voiceoverObject,
      endTimestamp: totalDuration
    }
  })

export const generateTextVoiceover = createServerAction()
  .input(
    z.object({
      senderVoiceId: z.string(),
      receiverVoiceId: z.string(),
      messages: TextMessageVideoSchema.shape.messages,
      language: z.nativeEnum(Language)
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

    const { senderVoiceId, receiverVoiceId, messages, language } = input

    const fullText = messages
      .filter((message) => message.content.type === 'text')
      .map((message) => message.content.value as string)
      .join(' ')

    const characterCount = fullText.length
    const requiredCredits = Math.ceil(
      characterCount / CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
    )

    try {
      const result = await db.transaction(async (tx) => {
        const userUsageRecord = await tx
          .select({ creditsLeft: userUsage.creditsLeft })
          .from(userUsage)
          .where(eq(userUsage.userId, user.id))
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
          .where(eq(userUsage.userId, user.id))

        const audioBuffers: Buffer[] = []
        const sections: Array<{ from: number; duration: number }> = []

        let currentTime = 0

        for (const message of messages) {
          const voiceId =
            message.sender === 'sender' ? senderVoiceId : receiverVoiceId

          if (message.content.type === 'text') {
            const messageText = message.content.value as string
            const fullMessageText = `${messageText} ——`

            const audioResponse =
              (await elevenLabsClient.textToSpeech.convertWithTimestamps(
                voiceId,
                {
                  model_id: 'eleven_multilingual_v2',
                  text: fullMessageText
                }
              )) as AudioResponse

            const audioBuffer = Buffer.from(
              audioResponse.audio_base64,
              'base64'
            )
            audioBuffers.push(audioBuffer)

            const endTimestamp =
              audioResponse.normalized_alignment.character_end_times_seconds.slice(
                -1
              )[0]
            const duration = endTimestamp

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

        return {
          signedUrl,
          sections,
          durationInFrames
        }
      })

      logger.info('Combined voiceover generated successfully', {
        signedUrl: result.signedUrl
      })
      await logger.flush()

      return result
    } catch (error) {
      logger.error(errorString, { error })
      await logger.flush()

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the voiceover.'
      )
    }
  })

export const generateStructuredVoiceover = createServerAction()
  .input(
    z.object({
      voiceId: AIVideoSchema.shape.voiceId,
      videoStructure: AIVideoSchema.shape.videoStructure,
      language: AIVideoSchema.shape.language
    })
  )
  .handler(async ({ input }) => {
    const logger = new Logger().with({
      function: 'generateStructuredVoiceover',
      ...input
    })
    logger.info(startingFunctionString)

    const { user } = await getUser()
    if (!user) {
      logger.error(errorString, { error: 'User not authorized' })
      await logger.flush()
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    const { voiceId, videoStructure, language } = input

    const fullText = videoStructure
      .map((section) => section.text)
      .join(' <break time="1s" /> ')
    const characterCount = fullText.length
    const requiredCredits = Math.ceil(
      characterCount / CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
    )

    try {
      const result = await db.transaction(async (tx) => {
        const userUsageRecord = await tx
          .select({ creditsLeft: userUsage.creditsLeft })
          .from(userUsage)
          .where(eq(userUsage.userId, user.id))
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
          .where(eq(userUsage.userId, user.id))

        const audio =
          (await elevenLabsClient.textToSpeech.convertWithTimestamps(voiceId, {
            model_id: 'eleven_multilingual_v2',
            text: fullText,
            language_code: language
          })) as AudioResponse

        const alignment = audio.normalized_alignment
        const totalDuration =
          alignment.character_end_times_seconds[
            alignment.character_end_times_seconds.length - 1
          ]

        const segmentDurations = []
        let currentPosition = 0
        const breakMarker = ' <break time="1s" /> '

        for (let i = 0; i < videoStructure.length; i++) {
          const segment = videoStructure[i]
          const segmentText = segment.text

          const segmentStart = currentPosition / fullText.length
          currentPosition +=
            segmentText.length +
            (i < videoStructure.length - 1 ? breakMarker.length : 0)
          const segmentEnd = currentPosition / fullText.length

          const startTime = segmentStart * totalDuration
          const endTime = segmentEnd * totalDuration

          segmentDurations.push(endTime - startTime)
        }

        const audioBuffer = Buffer.from(audio.audio_base64, 'base64')
        const s3Key = `voiceovers/${voiceId}/${crypto.randomUUID()}.mp3`

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

        return {
          signedUrl,
          endTimestamp: totalDuration,
          voiceoverObject: alignment,
          segmentDurations
        }
      })

      logger.info('Structured voiceover generated successfully', {
        signedUrl: result.signedUrl
      })
      await logger.flush()

      return result
    } catch (error) {
      logger.error(errorString, { error })
      await logger.flush()

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the voiceover.'
      )
    }
  })

export const generateTwitterVoiceover = createServerAction()
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
    const logger = new Logger().with({
      function: 'generateTwitterVoiceover',
      ...input
    })
    logger.info(startingFunctionString)

    const { user } = await getUser()
    if (!user) {
      logger.error(errorString, { error: 'User not authorized' })
      await logger.flush()
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    console.log(input)

    const fullText = input.tweets.map((tweet) => tweet.content).join(' ')
    const characterCount = fullText.length
    const requiredCredits = Math.ceil(
      characterCount / CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
    )

    try {
      const result = await db.transaction(async (tx) => {
        const userUsageRecord = await tx
          .select({ creditsLeft: userUsage.creditsLeft })
          .from(userUsage)
          .where(eq(userUsage.userId, user.id))
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
          .where(eq(userUsage.userId, user.id))

        const audioBuffers: Buffer[] = []
        const sections: Array<{ from: number; duration: number }> = []
        let currentTime = 0

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

          const tweetText = `${cleanContent} ---`

          const audioResponse =
            (await elevenLabsClient.textToSpeech.convertWithTimestamps(
              voiceSetting.voiceId,
              {
                model_id: 'eleven_multilingual_v2',
                text: tweetText,
                language_code: input.language
              }
            )) as AudioResponse

          const audioBuffer = Buffer.from(audioResponse.audio_base64, 'base64')
          audioBuffers.push(audioBuffer)

          const endTimestamp =
            audioResponse.normalized_alignment.character_end_times_seconds.slice(
              -1
            )[0]
          const duration = endTimestamp

          sections.push({ duration, from: currentTime })
          currentTime += duration
        }

        const totalDuration = sections.reduce(
          (sum, section) => sum + section.duration,
          0
        )

        const durationInFrames = Math.floor(totalDuration * VIDEO_FPS)

        const combinedAudioBuffer = Buffer.concat(audioBuffers)
        const s3Key = `voiceovers/twitter/${crypto.randomUUID()}.mp3`

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

        return {
          signedUrl,
          sections,
          durationInFrames
        }
      })

      logger.info('Twitter voiceover generated successfully', {
        signedUrl: result.signedUrl
      })
      await logger.flush()

      console.log(result)
      return result
    } catch (error) {
      logger.error(errorString, { error })
      await logger.flush()
      console.error(error)

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the voiceover.'
      )
    }
  })

export type ElevenlabsVoice = Awaited<ReturnType<typeof getVoices>>[number]

export type ElevenlabsLibraryVoice = Awaited<
  ReturnType<typeof getLibraryVoices>
>[number]

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
