'use client'

import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { FeedbackForm } from '@/components/feedback-form'

export default function Page() {
  const router = useRouter()
  return (
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            We value your input! Please share your thoughts with us.
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm />
      </DialogContent>
    </Dialog>
  )
}
