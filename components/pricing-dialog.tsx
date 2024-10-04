'use client'

import { useRouter } from 'next/navigation'
import { GetProductsResult } from '@/actions/db/user-queries'
import { User } from '@supabase/supabase-js'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import Faq from '@/components/faq'
import Pricing from '@/components/pricing'

export default function PricingDialog({
  products,
  user,
  subscription
}: {
  products: GetProductsResult
  user: User | null
  subscription: string | null
}) {
  const router = useRouter()

  return (
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="p-0 border-0 max-w-screen-xl">
        <DialogTitle className="hidden">Pricing</DialogTitle>
        <DialogDescription className="hidden">
          Choose the plan that best fits your needs.
        </DialogDescription>
        <ScrollArea className="max-h-[800px]">
          <Pricing
            products={products}
            user={user}
            subscription={subscription}
          />
          <Faq />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
