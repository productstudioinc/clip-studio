'use client'

import React, { createContext, ReactNode, useContext, useState } from 'react'

interface OnboardingData {
  name: string
  email: string
  companyName: string
  industry: string
  receiveUpdates: boolean
}

interface OnboardingContextType {
  currentStep: number
  setCurrentStep: (step: number) => void
  onboardingData: Partial<OnboardingData>
  updateOnboardingData: (data: Partial<OnboardingData>) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>(
    {}
  )

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prevData) => ({ ...prevData, ...data }))
  }

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        onboardingData,
        updateOnboardingData
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
