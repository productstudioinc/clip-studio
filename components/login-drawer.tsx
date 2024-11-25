'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useAppContext } from '@/contexts/app-context'

import { useMediaQuery } from '@/lib/hooks/use-media-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import LoginComponent from '@/components/login-form'

const Drawer = dynamic(() =>
  import('@/components/ui/drawer').then((mod) => mod.Drawer)
)

export function LoginDrawer({
  open,
  onOpenChange
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { user } = useAppContext()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [isOpen, setIsOpen] = useState(open || false)
  const [isPulsing, setIsPulsing] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const handleInteractOutside = (e: Event) => {
    e.preventDefault()
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), 100)
  }

  // Don't show the login drawer if the user is already logged in
  if (user) return null

  // Don't show the login drawer on the login page
  if (pathname !== '/') return null

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={`sm:max-w-3xl p-0 gap-0 ${
            isPulsing ? 'scale-[105%]' : 'scale-100'
          }`}
          onInteractOutside={handleInteractOutside}
        >
          <DialogHeader>
            <DialogTitle hidden>Login</DialogTitle>
            <DialogDescription hidden>
              Login to your account to continue
            </DialogDescription>
          </DialogHeader>
          <LoginComponent className="border-none" />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange} dismissible={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle hidden>Login</DrawerTitle>
          <DrawerDescription hidden>
            Login to your account to continue
          </DrawerDescription>
        </DrawerHeader>
        <LoginComponent className="border-none" />
      </DrawerContent>
    </Drawer>
  )
}
