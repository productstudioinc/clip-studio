import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/actions/auth/user'
import { Logger } from 'next-axiom'
import { generateVideo } from '@/trigger/aiVideo'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export const maxDuration = 300

const logger = new Logger({
  source: 'api/generate-video'
})

const promptSchema = z.object({
  imagePrompt: z.string().describe('A prompt describing the initial frame/scene to generate'),
  videoPrompt: z.string().describe('A prompt describing how that scene should animate/transform')
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

    const { prompt } = await request.json()

    const { object: prompts } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are a helpful AI that splits creative prompts into two parts:
        1. An image prompt that describes the initial frame/scene
        2. A video prompt that describes how that scene should animate/transform`,
      prompt,
      schema: promptSchema
    })


    console.log(prompts)
    
    const handle = await generateVideo.trigger({
      user_id: user.id,
      imagePrompt: prompts.imagePrompt,
      videoPrompt: prompts.videoPrompt
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
