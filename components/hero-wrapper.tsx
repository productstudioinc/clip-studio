'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import Hero from '@/components/hero'
import { Icons } from '@/components/icons'

export default function HeroWrapper() {
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
        <Button
          variant="link"
          className="flex w-full items-center justify-start gap-2 px-2 p-0 font-semibold"
        >
          <Icons.logo className="w-6 h-6" />
          <span>Clip Studio</span>
        </Button>
      </DialogTrigger>
      <Badge variant="secondary" className="ml-2">
        Beta
      </Badge>
      <DialogContent>
        <Hero />
      </DialogContent>
    </Dialog>
  )
}
