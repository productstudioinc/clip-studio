'use client'

import { useSearchParams } from 'next/navigation'

import { Demo } from '@/components/onboarding/demo'
import { HowItWorks } from '@/components/onboarding/how-it-works'
import { OnboardingHeader } from '@/components/onboarding/onboarding-header'
import { Step3 } from '@/components/onboarding/Step3'
import { Welcome } from '@/components/onboarding/welcome'

export function OnboardingFlow() {
  const searchParams = useSearchParams()
  const currentStep = parseInt(searchParams.get('step') || '0', 10)

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Welcome />
      case 1:
        return <HowItWorks />
      case 2:
        return <Demo />
      case 3:
        return <Step3 />
      default:
        return <div>Invalid step</div>
    }
  }

  return (
    <>
      <OnboardingHeader />
      <main className="flex-grow flex md:items-center justify-center">
        {renderStep()}
      </main>
    </>
  )
}
