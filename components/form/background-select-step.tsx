'use client'

import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { generatePresignedUrl } from '@/actions/generate-presigned-urls'
import { useAppContext } from '@/contexts/app-context'
import { SelectBackgroundWithParts } from '@/db/schema'
import { BackgroundTheme, VideoProps } from '@/stores/templatestore'
import { Pause, Play, Upload, X } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type BackgroundSelectStepProps = {
  form: UseFormReturn<VideoProps>
}

export const BackgroundSelectStep: FC<BackgroundSelectStepProps> = ({
  form
}) => {
  const { backgrounds, userUploads } = useAppContext()

  const [selectedBackground, setSelectedBackground] =
    useState<SelectBackgroundWithParts | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previousBackground, setPreviousBackground] = useState({
    theme: form.getValues('backgroundTheme'),
    urls: form.getValues('backgroundUrls')
  })

  useEffect(() => {
    const defaultTheme = form.getValues('backgroundTheme')
    const defaultBackground = backgrounds.find((bg) => bg.name === defaultTheme)
    if (defaultBackground) {
      setSelectedBackground(defaultBackground)
    }
  }, [form, backgrounds])

  const handleSelect = useCallback(
    (background: SelectBackgroundWithParts) => {
      form.setValue('backgroundTheme', background.name as BackgroundTheme)
      setSelectedBackground(background)
      form.setValue(
        'backgroundUrls',
        background.backgroundParts.map((part) => part.partUrl)
      )
    },
    [form]
  )

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files === null) return
    const file = event.target.files[0]

    setPreviousBackground({
      theme: form.getValues('backgroundTheme'),
      urls: form.getValues('backgroundUrls')
    })

    const MAX_FILE_SIZE = 200 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 200mb')
      return
    }

    setIsUploading(true)

    try {
      const blobUrl = URL.createObjectURL(file)
      setUploadPreviewUrl(blobUrl)
      form.setValue('backgroundTheme', BackgroundTheme.Custom)

      const contentType = file.type || 'application/octet-stream'
      const arrayBuffer = await file.arrayBuffer()
      const contentLength = arrayBuffer.byteLength

      const [data, err] = await generatePresignedUrl({
        contentType,
        contentLength,
        filename: file.name,
        tags: ['Background', 'Video']
      })

      if (err) throw new Error(err.message)

      await fetch(data.uploadUrl, {
        method: 'PUT',
        body: arrayBuffer,
        headers: { 'Content-Type': contentType }
      })

      form.setValue('backgroundUrls', [data.publicUrl])
      toast.success('Background uploaded successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const togglePlay = () => {
    const video = document.getElementById('preview-video') as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleClearPreview = () => {
    setUploadPreviewUrl(null)
    form.setValue('backgroundTheme', previousBackground.theme)
    form.setValue('backgroundUrls', previousBackground.urls)
  }

  const handleNewSection = useCallback(() => {
    const totalMinutes = Math.ceil(
      form.getValues('durationInFrames') / (30 * 60)
    )
    const currentUrls = form.getValues('backgroundUrls') || []
    const maxStartIndex = currentUrls.length - totalMinutes

    if (maxStartIndex <= 0) {
      toast.error('Not enough background segments available')
      return
    }

    const newStartIndex = Math.floor(Math.random() * maxStartIndex)
    form.setValue('backgroundStartIndex', newStartIndex)
  }, [form])

  const renderBackgroundOption = (
    background:
      | SelectBackgroundWithParts
      | { id: string; url: string; name?: string }
  ) => (
    <div key={background.id} className="flex-shrink-0">
      <Label className="relative flex-shrink-0 hover:cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
        <RadioGroupItem
          value={background.name || `user-upload-${background.id}`}
          className="sr-only"
        />
        <div className="w-[200px] h-[150px] relative group">
          <video
            src={
              background.url ||
              (background as SelectBackgroundWithParts).previewUrl
            }
            className="w-full h-full object-cover rounded-md"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
        {background.name && (
          <div className="w-full p-2 text-center text-sm truncate">
            {background.name}
          </div>
        )}
      </Label>
    </div>
  )

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Background</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewSection}
            type="button"
          >
            Randomize Section
          </Button>
        </div>

        <FormField
          control={form.control}
          name="backgroundTheme"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value)
                    if (value.startsWith('user-upload-')) {
                      const uploadId = value.replace('user-upload-', '')
                      const selectedUpload = userUploads.find(
                        (upload) => upload.id === uploadId
                      )
                      if (selectedUpload) {
                        form.setValue('backgroundTheme', BackgroundTheme.Custom)
                        form.setValue('backgroundUrls', [selectedUpload.url])
                      }
                    } else {
                      const selectedBackground = backgrounds.find(
                        (bg) => bg.name === value
                      )
                      if (selectedBackground) {
                        handleSelect(selectedBackground)
                      }
                    }
                  }}
                  value={field.value}
                  className="space-y-6"
                >
                  <Tabs defaultValue="library" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="library">Library</TabsTrigger>
                      <TabsTrigger value="my-uploads">My Uploads</TabsTrigger>
                    </TabsList>
                    <TabsContent value="library">
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4">
                          {backgrounds.map((background) =>
                            renderBackgroundOption(background)
                          )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="my-uploads">
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <Label className="relative flex-shrink-0 hover:cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-dashed bg-background hover:bg-accent/40 p-1 [&:has([data-state=checked])]:border-primary">
                              {uploadPreviewUrl ? (
                                <div className="w-[200px] h-[150px] relative bg-black rounded-lg overflow-hidden">
                                  <video
                                    id="preview-video"
                                    src={uploadPreviewUrl}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                  />
                                  {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <div className="text-white text-lg font-semibold">
                                        Uploading...
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={togglePlay}
                                        type="button"
                                      >
                                        {isPlaying ? (
                                          <Pause className="h-6 w-6" />
                                        ) : (
                                          <Play className="h-6 w-6" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={handleClearPreview}
                                        type="button"
                                      >
                                        <X className="h-6 w-6" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-[200px] h-[150px] flex flex-col items-center justify-center">
                                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Upload
                                  </p>
                                  <Input
                                    id="background-upload"
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                  />
                                </div>
                              )}
                            </Label>
                          </div>
                          {userUploads
                            .filter((upload) =>
                              upload.tags?.includes('Background')
                            )
                            .map((upload) => renderBackgroundOption(upload))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
