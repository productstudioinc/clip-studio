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

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const data = await getUserOnboardingStatus()
        if (data) {
          setStatus({
            hasGeneratedVideo: data.hasGeneratedVideo,
            videoGeneratedAt: data.videoGeneratedAt,
            responses: data.responses || null
          })
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch onboarding status')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchOnboardingStatus()
  }, [])

  return { ...status, isLoading, error }
}
