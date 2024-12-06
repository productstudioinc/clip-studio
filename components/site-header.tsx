import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="w-6 h-6" />
          <span className="text-lg font-bold">clip.studio</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hidden md:block"
            >
              Pricing
            </Link>
          </nav>
          <Link href="/home" className={buttonVariants({ variant: 'rainbow' })}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
