'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { GetUserSubscriptionResult } from '@/actions/auth/user'
import { GetUserUsageResult } from '@/actions/db/user-queries'
import { User } from '@supabase/supabase-js'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NavigationItems } from '@/components/navigation-items'

interface MobileSidebarProps {
  user: User | null
  admin: boolean
  subscription: GetUserSubscriptionResult | undefined
  usage: GetUserUsageResult
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  user,
  admin,
  subscription,
  usage
}) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="px-0 pt-8">
        <ScrollArea className="max-h-[calc(100vh-32px)] h-full">
          <NavigationItems
            user={user}
            admin={admin}
            mobile={true}
            subscription={subscription}
            usage={usage}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
