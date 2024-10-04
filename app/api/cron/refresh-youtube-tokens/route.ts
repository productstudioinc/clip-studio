import { NextResponse } from 'next/server'
import { refreshYoutubeAccessTokens } from '@/actions/youtube'
import { errorString } from '@/utils/logging'
import { AxiomRequest, withAxiom } from 'next-axiom'

export const GET = withAxiom(async (req: AxiomRequest) => {
  const logger = req.log.with({
    path: '/api/cron/refresh-youtube-tokens',
    method: 'GET'
  })
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  try {
    await refreshYoutubeAccessTokens()
    return NextResponse.json(
      { message: 'Successfully refreshed youtube access tokens' },
      { status: 200 }
    )
  } catch (error) {
    logger.error(errorString)
    return NextResponse.json(
      { message: 'Error refreshing youtube access tokens' },
      { status: 500 }
    )
  }
})
