'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function OnboardingHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStep = parseInt(searchParams.get('step') || '0', 10)
  const steps = 5 // Total number of steps
  const stepTitles = [
    'Welcome to Clip Studio',
    'How it works',
    'Demo',
    'Plans',
    'Done'
  ]
  const stepDescriptions = [
    '1. Welcome',
    '2. How it works',
    '3. Demo',
    '4. Plans',
    '5. Done'
  ]

  const handleStepClick = (step: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('step', step.toString())
    router.push(`/onboarding?${params.toString()}`)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      const params = new URLSearchParams(searchParams)
      params.set('step', (currentStep - 1).toString())
      router.push(`/onboarding?${params.toString()}`)
    }
  }

  if (currentStep === 0) return null

  return (
    <header className="p-4 border-b border-border">
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center justify-center w-full">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="Go back"
              className="absolute left-4"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="tracking-tight text-xl font-medium whitespace-nowrap text-center">
            {stepTitles[currentStep]}
          </h2>
        </div>
      </div>
      <div className="w-full flex gap-2">
        {Array.from({ length: steps }).map((_, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <button
              onClick={() => handleStepClick(index)}
              className={`w-full h-2 bg-secondary overflow-hidden rounded-full cursor-pointer ${
                index <= currentStep ? 'hover:bg-primary/70' : ''
              }`}
            >
              <div
                className={`h-full bg-primary transition-all duration-500 ease-in-out ${
                  index <= currentStep ? 'w-full' : 'w-0'
                }`}
              />
            </button>
            <span className="text-[11px] text-muted-foreground mt-1">
              {stepDescriptions[index]}
            </span>
          </div>
        ))}
      </div>
    </header>
  )
}
