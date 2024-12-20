import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/actions/auth/user'
import { Logger } from 'next-axiom'
import { generateVideo } from '@/trigger/aiVideo'

export const maxDuration = 300

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

    const handle = await generateVideo.trigger({
      user_id: user.id,
      prompt: 'A video of a cat playing with a ball'
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
