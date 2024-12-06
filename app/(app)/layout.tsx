import React from 'react'
import Link from 'next/link'
import { getUser, getUserSubscription } from '@/actions/auth/user'
import { isAdmin } from '@/actions/db/admin-queries'
import { getUserUsage } from '@/actions/db/user-queries'
import { getAppData } from '@/actions/get-app-data'

import { AppProvider } from '@/components/app-provider'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { LoginDrawer } from '@/components/login-drawer'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { NavigationItems } from '@/components/navigation-items'
import { SiteBanner } from '@/components/site-banner'

export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialData = await getAppData()
  const [{ user }, subscription, usage] = await Promise.all([
    getUser(),
    getUserSubscription(),
    getUserUsage()
  ])
  const admin = await isAdmin(user?.id || '')
  return (
    <AppProvider initialData={initialData}>
      <div
        className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[220px_1fr]"
        data-vaul-drawer-wrapper=""
      >
        <div className="hidden border-r bg-muted/40 md:block md:sticky md:top-0 md:h-screen">
          <NavigationItems
            user={user}
            admin={admin}
            subscription={subscription}
            usage={usage}
          />
        </div>
        <div className="flex flex-col flex-1">
          <SiteBanner />
          <header className="md:hidden flex items-center justify-between p-2 border-b sticky top-0 z-50 bg-background">
            <MobileSidebar
              user={user}
              subscription={subscription}
              usage={usage}
              admin={admin}
            />
          </header>
          <main className="flex-1 bg-muted/25 relative p-4">
            <Breadcrumbs />
            {children}
          </main>
          <footer className="border-t p-4 text-xs">
            <div className="flex flex-row justify-between items-center">
              <span>
                © {new Date().getFullYear()} <Link href="/">Clip Studio</Link>
              </span>
              <nav>
                <Link href="/privacy" className="mr-4">
                  Privacy Policy
                </Link>
                <Link href="/terms">Terms of Service</Link>
              </nav>
            </div>
          </footer>
        </div>
      </div>
      <LoginDrawer />
    </AppProvider>
  )
}
