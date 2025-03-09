import { NextResponse } from 'next/server'
import { getUserOnboardingStatus } from '@/actions/db/onboarding-queries'
import { createClient } from '@/supabase/server'

// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const onboardingStatus = await getUserOnboardingStatus()

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(
          `${origin}${onboardingStatus ? next : '/onboarding'}`
        )
      }

      // For production environment with load balancer
      const baseUrl = forwardedHost ? `https://${forwardedHost}` : origin
      return NextResponse.redirect(
        `${baseUrl}${onboardingStatus ? next : '/onboarding'}`
      )
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
