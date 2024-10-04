'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export const ErrorToast = () => {
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      const message = searchParams.get('error')
      if (message) {
        toast.error(message)
      }
    }
  }, [isMounted, searchParams])

  return null
}
