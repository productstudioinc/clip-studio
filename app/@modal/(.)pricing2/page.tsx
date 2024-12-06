import { getPricingData } from '@/actions/get-pricing-data'
import { PricingProvider } from '@/contexts/pricing-context'

import PricingDialog from '@/components/pricing-dialog'

export default async function Page() {
  const pricingData = await getPricingData()
  return (
    <PricingProvider initialData={pricingData}>
      <PricingDialog />
    </PricingProvider>
  )
}
