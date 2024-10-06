import React from 'react'
import Link from 'next/link'
import { getUser, getUserSubscription } from '@/actions/auth/user'
import { isAdmin } from '@/actions/db/admin-queries'
import { getUserUsage } from '@/actions/db/user-queries'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { NavigationItems } from '@/components/navigation-items'
import { SiteBanner } from '@/components/site-banner'

export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const [{ user }, subscription, usage] = await Promise.all([
    getUser(),
    getUserSubscription(),
    getUserUsage()
  ])

  const admin = await isAdmin(user?.id || '')

  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[220px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block md:sticky md:top-0 md:h-screen">
        <NavigationItems
          user={user}
          admin={admin}
          subscription={subscription}
          usage={usage}
        />
      </div>
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between p-2 border-b sticky top-0 z-10 bg-background">
          <MobileSidebar
            user={user}
            subscription={subscription}
            usage={usage}
            admin={admin}
          />
        </header>
        <SiteBanner />
        <main className="flex-1 bg-muted/25 relative p-4">
          <Breadcrumbs />
          {children}
        </main>
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
