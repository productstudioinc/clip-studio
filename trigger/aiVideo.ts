import { db } from '@/db'
import { userUploads, userUsage } from '@/db/schema'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { schemaTask } from "@trigger.dev/sdk/v3"
import { R2 } from '../utils/r2'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm/sql'
import { logger } from "@trigger.dev/sdk/v3"
import ffmpeg from "fluent-ffmpeg"
import os from "os"
import path from "path"
import fs from "fs/promises"

import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!
})

const VIDEO_GENERATION_CREDITS = 60

async function saveVideoUpload(userId: string, url: string, tags?: string[], status: 'pending' | 'completed' = 'completed', previewUrl?: string) {
  return db.insert(userUploads).values({
    userId,
    url,
    tags: tags || ['Video', 'AI'],
    status,
    previewUrl
  })
}

async function updateVideoUploadStatus(userId: string, url: string, status: 'pending' | 'completed') {
  return db
    .update(userUploads)
    .set({ status, updatedAt: new Date() })
    .where(sql`${userUploads.userId} = ${userId} AND ${userUploads.url} = ${url}`)
}

async function checkAndDeductCredits(userId: string, requiredCredits: number) {
  return await db.transaction(async (tx) => {
    const userUsageRecord = await tx
      .select({ creditsLeft: userUsage.creditsLeft })
      .from(userUsage)
      .where(eq(userUsage.userId, userId))
      .for('update')

    if (userUsageRecord.length === 0 || !userUsageRecord[0].creditsLeft) {
      throw new Error('You need an active subscription to use this feature.')
    }

    if (userUsageRecord[0].creditsLeft < requiredCredits) {
      throw new Error(`You don't have enough credits to generate this video. Required: ${requiredCredits}, Available: ${userUsageRecord[0].creditsLeft}`)
    }

    await tx
      .update(userUsage)
      .set({
        creditsLeft: sql`${userUsage.creditsLeft} - ${requiredCredits}`
      })
      .where(eq(userUsage.userId, userId))
  })
}

async function refundCredits(userId: string, credits: number) {
  try {
    await db
      .update(userUsage)
      .set({
        creditsLeft: sql`${userUsage.creditsLeft} + ${credits}`
      })
      .where(eq(userUsage.userId, userId))
  } catch (error) {
    logger.error('Failed to refund credits', { userId, credits, error })
  }
}

const VideoGenerationSchema = z.object({
  prompt: z.string(),
  prompt_optimizer: z.boolean().default(true),
  user_id: z.string()
})

async function generateThumbnail(videoBuffer: Buffer): Promise<Buffer> {
  const tempDirectory = os.tmpdir()
  const outputPath = path.join(tempDirectory, `thumbnail_${Date.now()}.jpg`)
  const inputPath = path.join(tempDirectory, `input_${Date.now()}.mp4`)

  await fs.writeFile(inputPath, videoBuffer)

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        count: 1,
        folder: tempDirectory,
        filename: path.basename(outputPath),
        size: '320x240',
        timemarks: ['00:00:00'], 
      })
      .on('end', resolve)
      .on('error', reject)
  })

  const thumbnail = await fs.readFile(outputPath)
  
  await Promise.all([
    fs.unlink(outputPath),
    fs.unlink(inputPath)
  ]).catch(error => {
    logger.error('Failed to clean up temp files', { error })
  })

  return thumbnail
}

export const generateVideo = schemaTask({
  id: 'generate-video',
  schema: VideoGenerationSchema,
  run: async (payload) => {
    let creditsDeducted = false;
    try {
      await checkAndDeductCredits(payload.user_id, VIDEO_GENERATION_CREDITS)
      creditsDeducted = true;

      const s3Key = `${payload.user_id}/videos/${crypto.randomUUID()}.mp4`
      const publicUrl = `${process.env.CLOUDFLARE_UPLOADS_PUBLIC_URL}/${s3Key}`
      
      await saveVideoUpload(payload.user_id, publicUrl, ['Video', 'AI Generated'], 'pending')
      
      try {
        const videoData = await replicate.run(
          "minimax/video-01",
          {
            input: {
              prompt: payload.prompt,
              prompt_optimizer: payload.prompt_optimizer
            }
          }
        )

        if (!videoData) {
          throw new Error('No video data received from Replicate API')
        }

        const response = await fetch(videoData as any)
        const videoBuffer = Buffer.from(await response.arrayBuffer())
        
        const thumbnailBuffer = await generateThumbnail(videoBuffer)
        const thumbnailKey = `${payload.user_id}/thumbnails/${crypto.randomUUID()}.jpg`
        const thumbnailUrl = `${process.env.CLOUDFLARE_UPLOADS_PUBLIC_URL}/${thumbnailKey}`
        
        await R2.send(new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg'
        }))

        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
          Key: s3Key,
          Body: videoBuffer,
          ContentType: 'video/mp4'
        })

        await R2.send(putObjectCommand)

        await updateVideoUploadStatus(payload.user_id, publicUrl, 'completed')

        await db
          .update(userUploads)
          .set({ previewUrl: thumbnailUrl })
          .where(sql`${userUploads.userId} = ${payload.user_id} AND ${userUploads.url} = ${publicUrl}`)

        logger.info('Video and thumbnail generated and saved successfully', {
          userId: payload.user_id,
          videoUrl: publicUrl,
          thumbnailUrl
        })

        return {
          videoUrl: publicUrl,
          thumbnailUrl
        }
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
        throw replicateError
      }
    } catch (error) {
      logger.error('Error generating video', {
        error: error instanceof Error ? error.message : String(error),
        userId: payload.user_id
      })

      if (creditsDeducted) {
        await refundCredits(payload.user_id, VIDEO_GENERATION_CREDITS)
      }
      throw error
    }
  }
})