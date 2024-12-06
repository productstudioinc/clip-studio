'use client'

import { createContext, ReactNode, useContext } from 'react'
import { GetProductsResult } from '@/actions/db/user-queries'
import { User } from '@supabase/supabase-js'

interface PricingData {
  user: User | null
  products: GetProductsResult
  subscription: string | null
}

const PricingContext = createContext<PricingData | undefined>(undefined)

export function PricingProvider({
  children,
  initialData
}: {
  children: ReactNode
  initialData: PricingData
}) {
  return (
    <PricingContext.Provider value={initialData}>
      {children}
    </PricingContext.Provider>
  )
}

export function usePricing() {
  const context = useContext(PricingContext)
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider')
  }
  return context
}
