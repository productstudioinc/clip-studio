'use client'

import { useSearchParams } from 'next/navigation'

import { ChooseAPlan } from '@/components/onboarding/choose-a-plan'
import { Demo } from '@/components/onboarding/demo'
import { GetStarted } from '@/components/onboarding/get-started'
import { HowItWorks } from '@/components/onboarding/how-it-works'
import { OnboardingHeader } from '@/components/onboarding/onboarding-header'
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
        return <ChooseAPlan />
      case 4:
        return <GetStarted />
      default:
        return null
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
