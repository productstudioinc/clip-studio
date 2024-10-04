import { db } from '@/db'
import { pastRenders, userUsage } from '@/db/schema'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import {
  validateWebhookSignature,
  WebhookPayload
} from '@remotion/lambda/client'
import { eq, sql } from 'drizzle-orm'
import { withAxiom } from 'next-axiom'

export const POST = withAxiom(async (req) => {
  req.log.with({
    path: '/api/render-webhook',
    method: req.method
  })
  let headers = {}

  if (process.env.NODE_ENV !== 'production') {
    const testingheaders = {
      'Access-Control-Allow-Origin': 'https://www.remotion.dev',
      'Access-Control-Allow-Headers':
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Remotion-Status, X-Remotion-Signature, X-Remotion-Mode',
      'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }
    headers = { ...headers, ...testingheaders }
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers
    })
  }

  const body = await req.json()

  validateWebhookSignature({
    secret: process.env.REMOTION_WEBHOOK_SECRET!,
    body: body,
    signatureHeader: req.headers.get('X-Remotion-Signature') as string
  })

  const payload = body as WebhookPayload

  switch (payload.type) {
    case 'error':
      req.log.error('Render error', {
        userEmail: payload.customData?.userEmail as string,
        renderId: payload.renderId,
        errors: payload.errors
      })
      const requiredCredits = Math.ceil(
        //@ts-ignore
        payload.customData.durationInFrames /
          30 /
          CREDIT_CONVERSIONS.EXPORT_SECONDS
      )
      await db
        .update(userUsage)
        .set({
          creditsLeft: sql`credits_left + ${requiredCredits}`
        })
        //@ts-ignore
        .where(eq(userUsage.userId, payload.customData.userId))
      break
    case 'success':
      const modifiedOutputUrl = payload.outputUrl?.replace(
        'https://s3.us-east-1.amazonaws.com/videogen-renders',
        'https://renders.clip.studio'
      )
      req.log.info('Render success', {
        renderId: payload.renderId,
        userEmail: payload.customData?.userEmail as string,
        outputUrl: modifiedOutputUrl,
        timeToFinish: payload.timeToFinish,
        estimatedCost: payload.costs.estimatedCost
      })
      await db.insert(pastRenders).values({
        userId: payload.customData?.userId as string,
        templateName: payload.customData?.templateName as string,
        videoUrl: modifiedOutputUrl,
        createdAt: new Date()
      })
      break
    case 'timeout':
      req.log.error('Render timeout', {
        renderId: payload.renderId
      })
  }

  return new Response(JSON.stringify({ success: true }))
})

export const OPTIONS = POST
