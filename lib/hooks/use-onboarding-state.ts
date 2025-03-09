import { useEffect, useState } from 'react'
import { getUserOnboardingStatus } from '@/actions/db/onboarding-queries'
import { SelectUserOnboardingResponses } from '@/db/schema'

type OnboardingStatus = {
  hasGeneratedVideo: boolean
  videoGeneratedAt: Date | null
  responses: SelectUserOnboardingResponses | null
}

export function useOnboardingState() {
  const [status, setStatus] = useState<OnboardingStatus>({
    hasGeneratedVideo: false,
    videoGeneratedAt: null,
    responses: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getUserOnboardingStatus()
      if (!data) throw new Error('No data received')

      setStatus({
        hasGeneratedVideo: data.hasGeneratedVideo,
        videoGeneratedAt: data.videoGeneratedAt,
        responses: data.responses || null
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch onboarding status')
      )
      // Keep the previous status on error
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    refresh()
  }, [])

  return {
    ...status,
    isLoading,
    error,
    refresh
  }
}
