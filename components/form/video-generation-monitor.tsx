'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { useRealtimeRunWithStreams } from "@trigger.dev/react-hooks"
import { VideoProps } from '@/stores/templatestore'
import { generateVideo } from '@/trigger/aiVideo'

type VideoGenerationResponse = {
  videoUrl: string
  thumbnailUrl: string
}

type VideoGenerationMonitorProps = {
  runId: string
  publicAccessToken: string
  index: number
  form: UseFormReturn<VideoProps>
  onComplete: (index: number) => void
}

export function VideoGenerationMonitor({ 
  runId, 
  publicAccessToken, 
  index, 
  form, 
  onComplete 
}: VideoGenerationMonitorProps) {
  const { error, run } = useRealtimeRunWithStreams<typeof generateVideo>(
    runId,
    {
      enabled: true,
      accessToken: publicAccessToken
    }
  )

  React.useEffect(() => {
    if (error) {
      toast.error(`Error monitoring video generation: ${error.message}`)
      onComplete(index)
    }

    if (run?.status === "COMPLETED" && run.output) {
      const output = run.output as VideoGenerationResponse
      const currentValue = form.getValues(`videoStructure.${index}`)
      if (currentValue && typeof currentValue === 'object' && 'videoDescription' in currentValue) {
        const path = `videoStructure.${index}` as const
        form.setValue(`${path}.videoUrl`, output.videoUrl)
        form.setValue(`${path}.thumbnailUrl`, output.thumbnailUrl)
      }
      onComplete(index)
    } else if (run?.status === "FAILED") {
      toast.error(`Failed to generate video: ${run.error?.message || 'Unknown error'}`)
      onComplete(index)
    }
  }, [run?.status, run?.output, error, form, index, onComplete])

  return null
} 