'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GetUserSubscriptionResult } from '@/actions/auth/user'
import { GetUserUsageResult } from '@/actions/db/user-queries'
import { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import {
  CircleUser,
  FilmIcon,
  LogInIcon,
  LucideIcon,
  MessageSquareIcon,
  Palette,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  YoutubeIcon,
  ZapIcon
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Hero from '@/components/hero'
import { Icons } from '@/components/icons'
import SubscriptionCard from '@/components/subscription-card'
import { UserAccountMenu } from '@/components/user-account-menu'

import { WhatsNew } from './whats-new'

export function UpgradeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>Create even more videos with AI</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/pricing"
          className={cn(
            buttonVariants({ size: 'sm', variant: 'rainbow' }),
            'w-full'
          )}
        >
          <ZapIcon className="h-4 w-4 mr-2 fill-current" />
          Upgrade
        </Link>
      </CardContent>
    </Card>
  )
}

export function HeroWrapper() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore')
    if (!hasVisited) {
      setIsOpen(true)
      localStorage.setItem('hasVisitedBefore', 'true')
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between">
          <Button
            variant="link"
            className="flex w-full items-center justify-start gap-2 px-2 p-0 font-semibold"
          >
            <Icons.logo className="w-6 h-6" />
            <span>Clip Studio</span>
          </Button>
          <Badge variant="secondary" className="ml-2">
            Beta
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent>
        <ScrollArea className="h-full w-full max-h-[70vh]">
          <Hero />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface NavItem {
  href: string
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  isHeader?: boolean
}

interface NavigationItemsProps {
  user: User | null
  admin: boolean
  mobile?: boolean
  subscription: GetUserSubscriptionResult | undefined
  usage: GetUserUsageResult
}

const NavLink: React.FC<NavItem & { currentRoute: string }> = ({
  href,
  icon: Icon,
  label,
  currentRoute
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
        currentRoute === href
          ? 'bg-muted text-primary'
          : 'text-muted-foreground'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ rotate: isHovered ? 15 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
      {label}
    </Link>
  )
}

const getNavItems = (admin: boolean, mobile: boolean): NavItem[] => [
  { href: '/', icon: Icons.logo, label: 'Home', isHeader: true },
  { href: '/', icon: Palette, label: 'Home' },
  { href: '/projects', icon: FilmIcon, label: 'Projects' },
  { href: '/account', icon: UserIcon, label: 'Account' },
  { href: '/feedback', icon: MessageSquareIcon, label: 'Submit Feedback' },
  {
    href: 'https://discord.gg/AVRVrVHTwQ',
    icon: Icons.discord,
    label: 'Join our Discord'
  },
  ...(admin
    ? [
        { href: '/admin', icon: ShieldIcon, label: 'Admin', isHeader: true },
        { href: '/admin', icon: ShieldIcon, label: 'Dashboard' },
        { href: '/admin/renders', icon: YoutubeIcon, label: 'View Renders' },
        { href: '/admin/users', icon: UsersIcon, label: 'Manage Users' },
        {
          href: '/admin/feedback',
          icon: MessageSquareIcon,
          label: 'View Feedback'
        }
      ]
    : [])
]

const renderSubscriptionCard = (
  user: User | null,
  subscription: GetUserSubscriptionResult | undefined,
  usage: GetUserUsageResult
) => {
  if (!user) return <UpgradeCard />
  return (
    <SubscriptionCard
      subscriptionName={subscription}
      usage={usage}
      userId={user.id}
    />
  )
}

export const NavigationItems: React.FC<NavigationItemsProps> = ({
  user,
  admin,
  subscription,
  usage,
  mobile = false
}) => {
  const currentRoute = usePathname()
  const navItems = getNavItems(admin, mobile)

  return (
    <aside className="flex h-full max-h-screen flex-col sm:text-sm sm:font-medium px-4">
      <HeroWrapper />

      {navItems.map((item, index) =>
        item.isHeader ? (
          <React.Fragment key={`header-${index}`}>
            <Separator className="my-2" />
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {item.label}
            </div>
          </React.Fragment>
        ) : (
          <NavLink key={item.href} {...item} currentRoute={currentRoute} />
        )
      )}

      <Separator className="my-2" />
      <div className="flex-1" />

      {renderSubscriptionCard(user, subscription, usage)}

      <Separator className="my-2" />
      <WhatsNew />
      <Separator className="my-2" />

      {user ? (
        <UserAccountMenu user={user} />
      ) : (
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary'
          )}
        >
          {mobile ? (
            <CircleUser className="h-4 w-4" />
          ) : (
            <LogInIcon className="h-4 w-4" />
          )}
          Login
        </Link>
      )}
    </aside>
  )
}
