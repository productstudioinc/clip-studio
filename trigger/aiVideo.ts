import { db } from '@/db'
import { userUploads } from '@/db/schema'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { Logger } from 'next-axiom'
import { schemaTask } from "@trigger.dev/sdk/v3"
import { R2 } from '../utils/r2'
import { z } from 'zod'

const logger = new Logger({
  source: 'trigger/aiVideo'
})

import Replicate from 'replicate'
import { sql } from 'drizzle-orm/sql'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!
})

async function saveVideoUpload(userId: string, url: string, tags?: string[], status: 'pending' | 'completed' = 'completed') {
  return db.insert(userUploads).values({
    userId,
    url,
    tags: tags || ['Video', 'AI Generated'],
    status
  })
}

async function updateVideoUploadStatus(userId: string, url: string, status: 'pending' | 'completed') {
  return db
    .update(userUploads)
    .set({ status, updatedAt: new Date() })
    .where(sql`${userUploads.userId} = ${userId} AND ${userUploads.url} = ${url}`)
}

const VideoGenerationSchema = z.object({
  prompt: z.string(),
  prompt_optimizer: z.boolean().default(true),
  user_id: z.string()
})

export const generateVideo = schemaTask({
  id: 'generate-video',
  schema: VideoGenerationSchema,
  run: async (payload) => {
    try {
      const s3Key = `${payload.user_id}/videos/${crypto.randomUUID()}.mp4`
      const publicUrl = `${process.env.CLOUDFLARE_UPLOADS_PUBLIC_URL}/${s3Key}`
      
      await saveVideoUpload(payload.user_id, publicUrl, ['Video', 'AI Generated'], 'pending')

      let output: object
      let videoBuffer: Buffer
      
      try {
        output = await replicate.run(
          "minimax/video-01",
          {
            input: {
              prompt: payload.prompt,
              prompt_optimizer: payload.prompt_optimizer
            }
          }
        )

        if (!output) {
          logger.error('Failed to generate video from Replicate API', {
            userId: payload.user_id,
            prompt: payload.prompt,
            output: 'No output received'
          })
          await logger.flush()
          throw new Error('Video generation failed: No output received from Replicate API')
        }

        const response = await fetch(output as unknown as string)
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.statusText}`)
        }
        videoBuffer = Buffer.from(await response.arrayBuffer())

      } catch (replicateError) {
        logger.error('Replicate API Error', {
          userId: payload.user_id,
          prompt: payload.prompt,
          error: replicateError instanceof Error ? {
            message: replicateError.message,
            name: replicateError.name,
            stack: replicateError.stack,
          } : replicateError
        })
        await logger.flush()
        throw replicateError
      }

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
        Key: s3Key,
        Body: videoBuffer,
        ContentType: 'video/mp4'
      })

      await R2.send(putObjectCommand)

      await updateVideoUploadStatus(payload.user_id, publicUrl, 'completed')

      logger.info('Video generated and saved successfully', {
        userId: payload.user_id,
        videoUrl: publicUrl
      })
      await logger.flush()

      return {
        videoUrl: publicUrl
      }
    } catch (error) {
      logger.error('Error generating video', {
        error: error instanceof Error ? error.message : String(error),
        userId: payload.user_id
      })
      await logger.flush()

      throw error
    }
  }
})