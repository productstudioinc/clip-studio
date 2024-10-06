import { Suspense } from 'react'
import { getUser, getUserSubscription } from '@/actions/auth/user'
import { getProducts } from '@/actions/db/user-queries'

import { Skeleton } from '@/components/ui/skeleton'
import Faq from '@/components/faq'
import Pricing from '@/components/pricing'

async function PricingContent() {
  const [products, { user }, subscription] = await Promise.all([
    getProducts(),
    getUser(),
    getUserSubscription()
  ])

  return (
    <>
      <Pricing
        products={products}
        user={user}
        subscription={subscription ?? null}
      />
      <Faq />
    </>
  )
}

function PricingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<PricingSkeleton />}>
      <PricingContent />
    </Suspense>
  )
}
