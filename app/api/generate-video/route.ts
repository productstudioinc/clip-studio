import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/actions/auth/user'
import { Logger } from 'next-axiom'
import { generateVideo } from '@/trigger/aiVideo'
import { z } from 'zod'

export const maxDuration = 300

const requestSchema = z.object({
  prompt: z.string(),
  useImageGeneration: z.boolean().default(false)
})

const logger = new Logger({
  source: 'api/generate-video'
})

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to use this feature.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, useImageGeneration } = requestSchema.parse(body)

    const handle = await generateVideo.trigger({
      user_id: user.id,
      videoPrompt: prompt,
      ...(useImageGeneration && { imagePrompt: prompt })
    })

    return NextResponse.json(handle)
  } catch (error) {
    logger.error('Error in video generation endpoint', {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    )
  }
}
