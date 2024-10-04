import React from 'react'
import Link from 'next/link'
import { getUser, getUserSubscription } from '@/actions/auth/user'
import { getUserUsage } from '@/actions/db/user-queries'

import HeroWrapper from '@/components/hero-wrapper'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { Sidebar } from '@/components/sidebar'
import { SiteBanner } from '@/components/site-banner'

export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const [{ user }, subscriptionData, usage] = await Promise.all([
    getUser(),
    getUserSubscription(),
    getUserUsage()
  ])
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block sticky top-0 h-screen">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex min-h-14 items-center border-b px-4 lg:px-6">
            <HeroWrapper />
          </div>
          <Sidebar user={user} subscription={subscriptionData} usage={usage} />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between p-2 border-b sticky top-0 z-10 bg-background">
          <MobileSidebar user={user} />
        </header>
        <SiteBanner />
        <main className="flex-1 bg-muted/25 relative">{children}</main>
        <footer className="border-t p-4 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <span>
              © {new Date().getFullYear()} <Link href="/">Clip Studio</Link> -
              AI Generated Videos
            </span>
            <nav className="mt-2 md:mt-0">
              <Link href="/privacy" className="mr-4">
                Privacy Policy
              </Link>
              <Link href="/terms">Terms of Service</Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  )
}
