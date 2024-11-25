'use client'

import { createContext, useContext } from 'react'

import type { AppData } from '@/types/app-data'

export const AppContext = createContext<AppData | null>(null)

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
