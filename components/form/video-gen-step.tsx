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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { VideoGenerationMonitor } from './video-generation-monitor'
import { SelectUserUploads } from '@/db/schema'
import { AssetPicker } from '@/components/asset-picker'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type VideoGenStepProps = {
  form: UseFormReturn<VideoProps>
}

type RunInfo = {
  id: string
  publicAccessToken: string
}

const createMockAsset = (url: string, index: number): SelectUserUploads => ({
  id: index.toString(),
  url,
  tags: ['Video', 'AI'],
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '',
  previewUrl: null,
  status: 'completed' as const
})

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

    indicesToGenerate.forEach(index => {
      setPendingRuns(prev => ({
        ...prev,
        [index]: { 
          id: 'pending',
          publicAccessToken: '' 
        }
      }))
    })

    await Promise.all(
      indicesToGenerate.map((index, i) =>
        sleep(i * 750).then(() => generateSingleVideo(index))
      )
    )

    setIsGeneratingAll(false)
  }

  const handleGenerateVideo = async (index: number) => {
    const button = document.querySelector(`button[data-index="${index}"]`)
    if (button) {
      button.setAttribute('disabled', 'true')
    }
    
    try {
      await generateSingleVideo(index)
    } catch (error) {
      if (button) {
        button.removeAttribute('disabled')
      }
      toast.error((error as Error).message)
    }
  }

  const canGenerateMore = videoStructure?.some(
    (item, index) => 'videoDescription' in item && 
      item.videoDescription && 
      !Object.keys(pendingRuns).includes(index.toString())
  )

  const handleAssetSelect = (index: number) => (asset: SelectUserUploads) => {
    form.setValue(`videoStructure.${index}.thumbnailUrl`, asset.url)
    form.setValue(`videoStructure.${index}.videoUrl`, asset.url)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generate Videos</CardTitle>
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
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full border rounded-md">
          <div className="p-4 space-y-4">
            {videoStructure?.map((item, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  {index in pendingRuns ? (
                    <Skeleton className="h-[150px] w-[150px] rounded-md" />
                  ) : (
                    <AssetPicker
                      tags={['Video', 'AI']}
                      onSelect={handleAssetSelect(index)}
                      selectedAsset={
                        'videoUrl' in item && item.videoUrl
                          ? createMockAsset(item.videoUrl, index)
                          : null
                      }
                    />
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
                  <div className="flex gap-2 mt-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleGenerateVideo(index)}
                      data-index={index}
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
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
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

