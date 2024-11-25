'use client'

import { AppContext } from '@/contexts/app-context'

import type { AppData } from '@/types/app-data'

interface AppProviderProps {
  children: React.ReactNode
  initialData: AppData
}

export function AppProvider({ children, initialData }: AppProviderProps) {
  return (
    <AppContext.Provider value={initialData}>{children}</AppContext.Provider>
  )
}
