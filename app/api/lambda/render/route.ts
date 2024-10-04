import { getUser } from '@/actions/auth/user'
import { DISK, RAM, REGION, SITE_NAME, TIMEOUT } from '@/config.mjs'
import { db } from '@/db'
import { userUsage } from '@/db/schema'
import { executeApi } from '@/helpers/api-response'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import {
  AwsRegion,
  renderMediaOnLambda,
  RenderMediaOnLambdaOutput,
  speculateFunctionName
} from '@remotion/lambda/client'
import { format } from 'date-fns'
import { eq, sql } from 'drizzle-orm'
import { AxiomRequest } from 'next-axiom'

import { RenderRequest } from '@/types/schema'

const templateNameMap = {
  SplitScreen: 'Splitscreen',
  TwitterThread: 'Twitter Thread',
  Reddit: 'Reddit Story'
}

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req: AxiomRequest, body) => {
    const logger = req.log

    if (
      !process.env.AWS_ACCESS_KEY_ID &&
      !process.env.REMOTION_AWS_ACCESS_KEY_ID
    ) {
      logger.error('Missing AWS access key')
      throw new TypeError(
        'Set up Remotion Lambda to render videos. See the README.md for how to do so.'
      )
    }
    if (
      !process.env.AWS_SECRET_ACCESS_KEY &&
      !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
    ) {
      logger.error('Missing AWS secret access key')
      throw new TypeError(
        'The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.'
      )
    }

    const { user } = await getUser()
    if (!user) {
      throw new Error('You must be logged in to use this.')
    }

    logger.info('User requested render', { email: user?.email })

    logger.info('Initiating renderMediaOnLambda', {
      composition: body.id,
      region: REGION,
      serveUrl: SITE_NAME
    })

    const userUsageRecord = await db
      .select({ creditsLeft: userUsage.creditsLeft })
      .from(userUsage)
      .where(eq(userUsage.userId, user.id))
      .limit(1)

    if (!userUsageRecord[0].creditsLeft) {
      logger.error('User does not have an active subscription', {
        email: user?.email
      })
      await logger.flush()
      throw new Error('You need an active subscription to use this feature.')
    }

    const creditsLeft = userUsageRecord[0].creditsLeft

    const requiredCredits = Math.ceil(
      body.inputProps.durationInFrames / 30 / CREDIT_CONVERSIONS.EXPORT_SECONDS
    )

    if (creditsLeft < requiredCredits) {
      logger.error('Not enough credits left to render', {
        email: user?.email,
        creditsLeft,
        requiredCredits
      })
      await logger.flush()
      throw new Error("You don't have enough credits to render this video.")
    }

    await db
      .update(userUsage)
      .set({
        creditsLeft: sql`credits_left - ${requiredCredits}`
      })
      .where(eq(userUsage.userId, user.id))

    const result = await renderMediaOnLambda({
      codec: 'h264',
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT
      }),
      region: REGION as AwsRegion,
      serveUrl: SITE_NAME,
      composition: body.id,
      inputProps: body.inputProps,
      logLevel: 'verbose',
      overwrite: true,
      downloadBehavior: {
        type: 'download',
        fileName: `${body.id}-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.mp4`
      },
      outName: {
        key: `renders/${crypto.randomUUID()}-${Date.now()}.mp4`,
        bucketName: 'videogen-renders',
        s3OutputProvider: {
          endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
          secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!
        }
      },
      webhook: {
        url: 'https://clip.studio/api/render-webhook',
        secret: process.env.REMOTION_WEBHOOK_SECRET!,
        customData: {
          durationInFrames: body.inputProps.durationInFrames,
          userId: user.id,
          userEmail: user.email,
          templateName:
            templateNameMap[body.id as keyof typeof templateNameMap] || body.id
        }
      }
    })

    logger.info('renderMediaOnLambda completed successfully', {
      renderId: result.renderId,
      bucketName: result.bucketName
    })

    // encrypt renderId with durationInFrames
    const dataToEncrypt = `${result.renderId}:${body.inputProps.durationInFrames}`
    const encryptedData = encryptData(
      dataToEncrypt,
      process.env.RENDER_ENCRYPTION_KEY!
    )

    const modifiedResult = {
      ...result,
      renderId: encryptedData
    }

    await logger.flush()

    return modifiedResult
  }
)

function encryptData(data: string, key: string): string {
  const crypto = require('crypto')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  )
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}
