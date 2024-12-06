'use client'

import { useEffect, useState } from 'react'
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

function SaleBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() + 3)
      endDate.setHours(23, 59, 59, 999)

      const timeUntilEnd = Math.abs(endDate.getTime() - now.getTime())

      setTimeLeft({
        days: Math.floor(timeUntilEnd / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeUntilEnd / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeUntilEnd / (1000 * 60)) % 60),
        seconds: Math.floor((timeUntilEnd / 1000) % 60)
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])
  return (
    <Link
      href="/pricing"
      onClick={() => posthog.capture('banner_clicked')}
      className="bg-amber-400 py-1 text-center text-lg font-semibold text-gray-950 cursor-pointer group relative md:py-2 block"
    >
      <div className="container justify-center h-full flex items-center flex-nowrap whitespace-nowrap overflow-hidden">
        <span className="hidden md:flex items-center gap-2 min-w-0 truncate">
          <span className="truncate">🔥 Cyber Week Sale: 60% off!</span>
          <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-lg font-bold shrink-0">
            Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{' '}
            {timeLeft.seconds}s
          </span>
        </span>
        <span className="md:hidden flex items-center gap-2 min-w-0 truncate">
          <span className="truncate">🔥 60% off first month!</span>
          <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-sm font-bold shrink-0">
            {timeLeft.days}d {timeLeft.hours}h left
          </span>
        </span>
        <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 shrink-0" />
      </div>
      <hr className="absolute bottom-0 m-0 h-px w-full bg-[#D4AF37]" />
    </Link>
  )
}

export function SiteBanner() {
  return <SaleBanner />
}
