'use client'

import { useRouter } from 'next/navigation'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import LoginComponent from '@/components/login-form'

export default function Page() {
  const router = useRouter()
  return (
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <DialogTitle className="hidden">Login</DialogTitle>
      <DialogContent className="p-0 border-0 max-w-sm">
        <LoginComponent />
      </DialogContent>
    </Dialog>
  )
}
