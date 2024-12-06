import { getPricingData } from '@/actions/get-pricing-data'
import { PricingProvider } from '@/contexts/pricing-context'

import { CreditCalculator } from '@/components/credit-calculator-simple'
import Faq from '@/components/faq'
import Pricing from '@/components/pricing'

export default async function Page() {
  const pricingData = await getPricingData()
  return (
    <PricingProvider initialData={pricingData}>
      <div className="flex flex-col gap-8 p-4 max-w-full mx-auto">
        <Pricing />
        <CreditCalculator />
        <Faq />
      </div>
    </PricingProvider>
  )
}
