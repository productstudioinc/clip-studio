'use client'

import { useRouter } from 'next/navigation'

import { siteConfig } from '@/lib/config'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle
} from '@/components/ui/dialog'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleOpenChange = () => {
    router.back()
  }

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay>
        <DialogContent className="overflow-y-hidden">
          <DialogTitle hidden>{siteConfig.name}</DialogTitle>
          <DialogDescription hidden>{siteConfig.description}</DialogDescription>
          {children}
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}
