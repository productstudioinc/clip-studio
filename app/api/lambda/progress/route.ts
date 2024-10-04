import crypto from 'crypto'
import { getUser } from '@/actions/auth/user'
import { DISK, RAM, REGION, TIMEOUT } from '@/config.mjs'
import { db } from '@/db'
import { userUsage } from '@/db/schema'
import { executeApi } from '@/helpers/api-response'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import {
  AwsRegion,
  getRenderProgress,
  speculateFunctionName
} from '@remotion/lambda/client'
import { eq, sql } from 'drizzle-orm'
import { AxiomRequest } from 'next-axiom'

import { ProgressRequest, ProgressResponse } from '@/types/schema'

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req: AxiomRequest, body) => {
    const logger = req.log
    const { user } = await getUser()
    if (!user) {
      throw new Error('You must be logged in to use this.')
    }

    // Decrypt the renderId
    const decryptedData = decryptData(
      body.id,
      process.env.RENDER_ENCRYPTION_KEY!
    )
    const [renderId, durationInFrames] = decryptedData.split(':')

    logger.info('Initiating getRenderProgress', {
      bucketName: body.bucketName,
      renderId: renderId,
      region: REGION,
      durationInFrames: durationInFrames
    })

    const renderProgress = await getRenderProgress({
      bucketName: body.bucketName,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT
      }),
      region: REGION as AwsRegion,
      renderId: renderId,
      s3OutputProvider: {
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!
      }
    })

    if (renderProgress.fatalErrorEncountered) {
      logger.error('Fatal error encountered in render progress', {
        error: renderProgress.errors[0].message,
        renderId: body.id
      })
      await logger.flush()
      const requiredCredits = Math.ceil(
        Number(durationInFrames) / 30 / CREDIT_CONVERSIONS.EXPORT_SECONDS
      )
      await db
        .update(userUsage)
        .set({
          creditsLeft: sql`credits_left + ${requiredCredits}`
        })
        .where(eq(userUsage.userId, user.id))
      return {
        type: 'error',
        message: `Your render failed and your credits have been refunded. Please try again or clear your template settings if this error persists.`
      }
    }
    if (renderProgress.done) {
      let outputFile = renderProgress.outputFile as string
      // Replace the URL prefix
      outputFile = outputFile.replace(
        'https://s3.us-east-1.amazonaws.com/videogen-renders',
        'https://renders.clip.studio'
      )
      logger.info('Render completed successfully', {
        renderId: body.id,
        outputFile: outputFile,
        outputSize: renderProgress.outputSizeInBytes
      })
      return {
        type: 'done',
        url: outputFile,
        size: renderProgress.outputSizeInBytes as number
      }
    }
    logger.info('Render in progress', {
      renderId: body.id,
      progress: Math.max(0.03, renderProgress.overallProgress)
    })
    await logger.flush()
    return {
      type: 'progress',
      progress: Math.max(0.03, renderProgress.overallProgress)
    }
  }
)

function decryptData(encryptedData: string, key: string): string {
  const [ivHex, encryptedHex] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  )
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf8')
}
