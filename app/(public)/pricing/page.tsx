import { getPricingData } from '@/actions/get-pricing-data'
import { PricingProvider } from '@/contexts/pricing-context'

import { CreditCalculator } from '@/components/credit-calculator-simple'
import Faq from '@/components/faq'
import Pricing from '@/components/pricing'

export default async function Page() {
  const pricingData = await getPricingData()
  return (
    <PricingProvider initialData={pricingData}>
      <Pricing />
      <CreditCalculator />
      <Faq />
    </PricingProvider>
  )
}
