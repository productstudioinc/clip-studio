import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { AxiomRequest, withAxiom } from 'next-axiom'

export const GET = withAxiom(async (request: AxiomRequest) => {
  const logger = request.log.with({
    path: '/auth/callback',
    method: 'GET'
  })

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  logger.info('Auth callback initiated', { next })

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      logger.info('Successfully exchanged code for session')
      return NextResponse.redirect(getSupabaseAuthRedirectURL(next))
    } else {
      logger.error('Failed to exchange code for session', {
        error: error.message
      })
    }
  } else {
    logger.warn('No code provided in auth callback')
  }

  logger.info('Redirecting to auth error page')
  return NextResponse.redirect(
    getSupabaseAuthRedirectURL('auth/auth-code-error')
  )
})

const getSupabaseAuthRedirectURL = (queryParam?: string) => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  if (!queryParam) {
    return url
  }

  // add potential query params
  url = `${url}${queryParam}`

  return url
}
