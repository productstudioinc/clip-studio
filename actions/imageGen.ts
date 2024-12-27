'use server'

import { db } from '@/db'
import { userUploads } from '@/db/schema'
import { VisualStyle } from '@/stores/templatestore'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { Logger } from 'next-axiom'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

import { R2 } from '../utils/r2'
import { getUser } from './auth/user'

const promptMap: Record<VisualStyle, string> = {
  [VisualStyle.Realistic]:
    'professional 3d model {prompt}. octane render, highly detailed, volumetric, dramatic lighting',
  [VisualStyle.Cartoon]:
    'cartoon style {prompt} . anime style, key visual, vibrant, studio anime, highly detailed',
  [VisualStyle.Anime]:
    'anime artwork {prompt} . anime style, key visual, vibrant, studio anime, highly detailed',
  [VisualStyle.Neopunk]:
    'neonpunk style {prompt} . cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern',
  [VisualStyle.JapaneseInk]:
    'Japanese ink wash painting {prompt} . sumi-e style, brush strokes, monochrome, Zen-like simplicity',
  [VisualStyle.LineArt]:
    'line art drawing {prompt} . professional, sleek, modern, minimalist, graphic, line art, vector graphics',
  [VisualStyle.Medieval]:
    'gothic fantasy {prompt} . dark and brooding atmosphere, medieval architecture, mythical creatures',
  [VisualStyle.Cinematic]:
    'cinematic still {prompt} . emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, gorgeous, film grain, grainy',
  [VisualStyle.Playdoh]:
    'play-doh style {prompt} . sculpture, clay art, centered composition, Claymation'
}

const logger = new Logger({
  source: 'actions/image-gen'
})

async function saveImageUpload(userId: string, url: string, tags?: string[]) {
  return db.insert(userUploads).values({
    userId,
    tags: tags || [],
    url
  })
}

export const generateImages = createServerAction()
  .input(
    z.object({
      prompt: z.string(),
      visualStyle: z.nativeEnum(VisualStyle)
    })
  )
  .handler(async ({ input }) => {
    const { user } = await getUser()
    if (!user) {
      logger.error('User not authorized')
      await logger.flush()
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    const { prompt, visualStyle } = input

    const stylePrompt = promptMap[visualStyle].replace('{prompt}', prompt)
    const encodedPrompt = encodeURIComponent(stylePrompt)

    try {
      const response = await fetch(
        `${process.env.FLUX_MODAL_URL}?prompt=${encodedPrompt}&negative_prompt=blurry, washed out, flat, messy, pixelated`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.FLUX_API_KEY!
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          logger.error('Authentication failed for image generation API', {
            status: response.status,
            statusText: response.statusText
          })
          throw new ZSAError(
            'NOT_AUTHORIZED',
            'Failed to authenticate with the image generation service. Please check your API key.'
          )
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const imageBuffer = await response.arrayBuffer()
      const s3Key = `generated-images/${crypto.randomUUID()}.png`

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
        Key: s3Key,
        Body: Buffer.from(imageBuffer),
        ContentType: 'image/png'
      })

      await R2.send(putObjectCommand)

      const publicUrl = `${process.env.CLOUDFLARE_UPLOADS_PUBLIC_URL}/${s3Key}`

      await saveImageUpload(user.id, publicUrl, ['AI', 'Image'])

      logger.info('Image generated and uploaded successfully', { publicUrl })
      await logger.flush()

      return { signedUrl: publicUrl }
    } catch (error) {
      if (error instanceof ZSAError) {
        throw error
      }
      logger.error('Error generating or uploading image', {
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the image.'
      )
    }
  })
