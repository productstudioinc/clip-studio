'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import posthog from 'posthog-js'

const DiscordBanner = () => {
  return (
    <Link
      href="/discord"
      onClick={() => posthog.capture('banner_clicked')}
      className="group relative top-0 bg-[#5865F2] py-2 text-white transition-all duration-300 md:py-4 block"
    >
      <div className="container justify-center h-full flex items-center text-sm">
        💬
        <span className="ml-1 font-medium">
          <span className="md:hidden">Join our Discord community!</span>
          <span className="hidden md:inline">
            Join our Discord to request features, and hang out with the team!
          </span>
        </span>
        <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </div>
      <hr className="absolute bottom-0 m-0 h-px w-full bg-[#4752C4]" />
    </Link>
  )
}

export function SiteBanner() {
  return <DiscordBanner />
}
