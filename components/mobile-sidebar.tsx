'use client'

import React from 'react'
import { GetUserSubscriptionResult } from '@/actions/auth/user'
import { GetUserUsageResult } from '@/actions/db/user-queries'
import { User } from '@supabase/supabase-js'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 pt-8">
        <NavigationItems
          user={user}
          admin={admin}
          mobile={true}
          subscription={subscription}
          usage={usage}
        />
      </SheetContent>
    </Sheet>
  )
}
