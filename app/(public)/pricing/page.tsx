import { getUser, getUserSubscription } from '@/actions/auth/user'
import { getProducts } from '@/actions/db/user-queries'

import { CreditCalculator } from '@/components/credit-calculator-simple'
import Faq from '@/components/faq'
import Pricing from '@/components/pricing'

export default async function Page() {
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
      <CreditCalculator />
      <Faq />
    </>
  )
}
