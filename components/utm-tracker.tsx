'use client'

import { useEffect } from 'react'

import useUTMs from '@/lib/hooks/useUTM'

export default function UTMTracker() {
  const { setUTMCookie, deleteUTMCookie } = useUTMs()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    setUTMCookie()
    return () => {
      deleteUTMCookie()
    }
  }, [setUTMCookie, deleteUTMCookie])

  return null
}
