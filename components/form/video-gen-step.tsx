'use client'

import React from 'react'
import { VideoProps } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { Loader2, RefreshCcw, Wand2 } from 'lucide-react'
import { UseFormReturn, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import HeroVideoDialog from '@/components/ui/hero-video-dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { VideoGenerationMonitor } from './video-generation-monitor'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type VideoGenStepProps = {
  form: UseFormReturn<VideoProps>
}

type RunInfo = {
  id: string
  publicAccessToken: string
}

export function VideoGenStep({ form }: VideoGenStepProps) {
  const [pendingRuns, setPendingRuns] = React.useState<Record<number, RunInfo>>({})
  const [isGeneratingAll, setIsGeneratingAll] = React.useState(false)

  const videoStructure = useWatch({
    control: form.control,
    name: 'videoStructure'
  })

  const handleRunComplete = (index: number) => {
    setPendingRuns(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const generateSingleVideo = async (index: number) => {
    const item = form.getValues(`videoStructure.${index}`)
    const description = 'videoDescription' in item ? item.videoDescription : null
    
    if (description) {
      try {
        const response = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: description })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to generate video')
        }

        const data = await response.json()
        setPendingRuns(prev => ({
          ...prev,
          [index]: { 
            id: data.id, 
            publicAccessToken: data.publicAccessToken 
          } 
        }))
      } catch (error) {
        toast.error((error as Error).message)
      }
    }
  }

  const handleGenerateAllVideos = async () => {
    setIsGeneratingAll(true)
    const videoStructure = form.getValues('videoStructure')
    const indicesToGenerate = videoStructure
      .map((item, index) =>
        'videoDescription' in item && item.videoDescription && !Object.keys(pendingRuns).includes(index.toString()) ? index : -1
      )
      .filter((index) => index !== -1)

    await Promise.all(
      indicesToGenerate.map((index, i) =>
        sleep(i * 750).then(() => generateSingleVideo(index))
      )
    )

    setIsGeneratingAll(false)
  }

  const handleGenerateVideo = async (index: number) => {
    try {
      await generateSingleVideo(index)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const canGenerateMore = videoStructure?.some(
    (item, index) => 'videoDescription' in item && 
      item.videoDescription && 
      !Object.keys(pendingRuns).includes(index.toString())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Video Generation</h3>
            <Button
              onClick={handleGenerateAllVideos}
              disabled={isGeneratingAll || !canGenerateMore}
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating All...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate All Videos
                </>
              )}
              <span className="text-muted-foreground ml-1">
                ~ {CREDIT_CONVERSIONS.VIDEO_GENERATION *
                  (videoStructure?.length || 0)} credits
              </span>
            </Button>
          </div>
          <ScrollArea className="h-[400px] w-full border rounded-md">
            <div className="p-4 space-y-4">
              {videoStructure?.map((item, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    {index in pendingRuns ? (
                      <Skeleton className="h-[150px] w-[150px] rounded-md" />
                    ) : 'videoUrl' in item && item.videoUrl ? (
                      <HeroVideoDialog
                        videoSrc={item.videoUrl}
                        thumbnailSrc={item.thumbnailUrl || ''}
                        thumbnailAlt={`Video ${index + 1}`}
                        className="h-[150px] w-[150px]"
                        animationStyle="from-center"
                      />
                    ) : (
                      <div className="h-[150px] w-[150px] rounded-md bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No video</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col">
                    <FormField
                      control={form.control}
                      name={`videoStructure.${index}.videoDescription`}
                      render={({ field }) => (
                        <FormItem className="flex-grow h-full">
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={`Enter description for video ${index + 1}`}
                              className="flex-grow resize-none h-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      className="mt-2 w-full"
                      onClick={() => handleGenerateVideo(index)}
                      disabled={
                        (index in pendingRuns) ||
                        !('videoDescription' in item && item.videoDescription)
                      }
                    >
                      {index in pendingRuns ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : 'videoUrl' in item && item.videoUrl ? (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Regenerate Video
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Video
                        </>
                      )}
                      <span className="text-muted-foreground ml-1">
                        ~ {CREDIT_CONVERSIONS.VIDEO_GENERATION} credits
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </CardContent>
      {Object.entries(pendingRuns).map(([index, runInfo]) => (
        <div key={runInfo.id}>
          {process.env.NODE_ENV === 'development' && (
            <p className="px-6 text-sm text-muted-foreground">
              Monitoring generation: {runInfo.id}
            </p>
          )}
          <VideoGenerationMonitor
            runId={runInfo.id}
            publicAccessToken={runInfo.publicAccessToken}
            index={Number(index)}
            form={form}
            onComplete={handleRunComplete}
          />
        </div>
      ))}
    </Card>
  )
}
