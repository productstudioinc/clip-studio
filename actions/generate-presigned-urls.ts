'use server'

import { getUser } from '@/actions/auth/user'
import { db } from '@/db'
import { userUploads } from '@/db/schema'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Logger } from 'next-axiom'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

import { R2 } from '../utils/r2'

const logger = new Logger({
  source: 'actions/generatePresignedUrl'
})

async function saveUpload(userId: string, url: string, tags?: string[]) {
  return db.insert(userUploads).values({
    userId,
    tags: tags || [],
    url
  })
}

export const generatePresignedUrl = createServerAction()
  .input(
    z.object({
      contentType: z.string(),
      contentLength: z.number(),
      filename: z.string().optional(),
      tags: z.array(z.string()).optional()
    })
  )
  .handler(async ({ input }) => {
    const { user } = await getUser()
    if (!user) {
      logger.error('User not authenticated')
      await logger.flush()
      throw new ZSAError('NOT_AUTHORIZED', 'You must be logged in to use this.')
    }

    if (input.contentLength > 1024 * 1024 * 200) {
      logger.error('Payload too large', {
        email: user.email,
        contentLength: input.contentLength
      })
      await logger.flush()
      throw new ZSAError(
        'PAYLOAD_TOO_LARGE',
        `File may not be over 200MB. Yours is ${input.contentLength} bytes.`
      )
    }

    const key = `uploads/${user.id}/${crypto.randomUUID()}-${input.filename}`

    try {
      const putCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
        Key: key,
        ContentLength: input.contentLength,
        ContentType: input.contentType
      })

      const presignedPutUrl = await getSignedUrl(R2, putCommand, {
        expiresIn: 60 * 60
      })

      const publicUrl = `${process.env.CLOUDFLARE_UPLOADS_PUBLIC_URL}/${key}`

      await saveUpload(user.id, publicUrl, input.tags)

      logger.info('Generated presigned URL and saved upload record', {
        email: user.email,
        key
      })
      await logger.flush()

      return {
        uploadUrl: presignedPutUrl,
        publicUrl
      }
    } catch (error) {
      logger.error('Error generating presigned URL', {
        email: user.email,
        error: error instanceof Error ? error.message : String(error)
      })
      await logger.flush()
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while generating the presigned URL.'
      )
    }
  })
