import { NextFetchEvent, type NextRequest } from 'next/server'
import { Logger } from 'next-axiom'

import { updateSession } from './supabase/middleware'

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = await updateSession(request)
  const logger = new Logger({ source: 'middleware' })
  logger.middleware(request)
  event.waitUntil(logger.flush())

  // if (process.env.NODE_ENV === "production") {
  //   const url = request.nextUrl.clone();
  //   if (url.pathname !== "/") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  // }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
