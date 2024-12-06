import { getAppData } from '@/actions/get-app-data'
import { getPricingData } from '@/actions/get-pricing-data'
import { OnboardingProvider } from '@/contexts/onboarding-context'
import { PricingProvider } from '@/contexts/pricing-context'

import { AppProvider } from '@/components/app-provider'
import { OnboardingFlow } from '@/components/onboarding'

export default async function Onboarding() {
  const initialData = await getAppData()
  const pricingData = await getPricingData()
  return (
    <AppProvider initialData={initialData}>
      <PricingProvider initialData={pricingData}>
        <OnboardingProvider>
          <OnboardingFlow />
        </OnboardingProvider>
      </PricingProvider>
    </AppProvider>
  )
}
