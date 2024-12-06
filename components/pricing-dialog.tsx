'use client'

import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CreditCalculator } from '@/components/credit-calculator-simple'
import Faq from '@/components/faq'
import Pricing from '@/components/pricing'

export default function PricingDialog() {
  const router = useRouter()
  return (
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="p-0 border-0 max-w-[90vw] h-[90vh]">
        <DialogTitle className="hidden">Pricing</DialogTitle>
        <DialogDescription className="hidden">
          Choose the plan that best fits your needs.
        </DialogDescription>
        <ScrollArea>
          <Pricing />
          <CreditCalculator />
          <Faq />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
