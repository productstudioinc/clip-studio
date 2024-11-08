'use client'

import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { generatePresignedUrl } from '@/actions/generate-presigned-urls'
import { SelectBackgroundWithParts } from '@/db/schema'
import { BackgroundTheme, VideoProps } from '@/stores/templatestore'
import { Pause, Play, Upload, X } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

type BackgroundSelectStepProps = {
  form: UseFormReturn<VideoProps>
  backgrounds: SelectBackgroundWithParts[]
}

export const BackgroundSelectStep: FC<BackgroundSelectStepProps> = ({
  form,
  backgrounds
}) => {
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

  const selectBackgroundSection = useCallback(
    (background: SelectBackgroundWithParts) => {
      const totalParts = background.backgroundParts.length
      const partsNeeded = 5
      const maxStartIndex = totalParts - partsNeeded
      const startIndex = Math.floor(Math.random() * (maxStartIndex + 1))

      const selectedParts = background.backgroundParts.slice(
        startIndex,
        startIndex + partsNeeded
      )

      form.setValue(
        'backgroundUrls',
        selectedParts.map((part) => part.partUrl)
      )
    },
    [form]
  )

  const handleSelect = useCallback(
    (background: SelectBackgroundWithParts) => {
      form.setValue('backgroundTheme', background.name as BackgroundTheme)
      setSelectedBackground(background)
      selectBackgroundSection(background)
    },
    [form, selectBackgroundSection]
  )

  const handleNewSection = useCallback(() => {
    if (selectedBackground) {
      selectBackgroundSection(selectedBackground)
    }
  }, [selectedBackground, selectBackgroundSection])

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
        contentLength
      })

      if (err) throw new Error(err.message)

      await fetch(data.presignedUrl, {
        method: 'PUT',
        body: arrayBuffer,
        headers: { 'Content-Type': contentType }
      })

      form.setValue('backgroundUrls', [data.readUrl])
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

  const uploadContent = uploadPreviewUrl ? (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        id="preview-video"
        src={uploadPreviewUrl}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-lg font-semibold">
            Uploading video...
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
    <div className="flex flex-col items-center justify-center h-full">
      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold">Upload</span>
      </p>
      <p className="text-xs text-muted-foreground">Custom Background</p>
      <Input
        id="background-upload"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Background</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <FormField
            control={form.control}
            name="backgroundTheme"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value)
                      const selectedBackground = backgrounds.find(
                        (bg) => bg.name === value
                      )
                      if (selectedBackground) {
                        handleSelect(selectedBackground)
                      }
                    }}
                    value={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <Label className="relative flex-shrink-0 hover:cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-dashed bg-background hover:bg-accent/40 p-1 [&:has([data-state=checked])]:border-primary w-[230px] h-[200px]">
                        {uploadContent}
                      </Label>
                    </div>
                    {backgrounds.map((background) => (
                      <div key={background.id} className="flex-shrink-0">
                        <Label className="relative flex-shrink-0 hover:cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                          <RadioGroupItem
                            value={background.name}
                            className="sr-only"
                          />
                          <div className="w-[200px]">
                            <video
                              src={background.previewUrl}
                              className="w-full h-[150px] object-cover rounded-md"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                            <div className="w-full p-2 text-center">
                              {background.name}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Button
          onClick={handleNewSection}
          className="mt-4"
          disabled={!selectedBackground}
          type="button"
        >
          Choose New Section
        </Button>
      </CardContent>
    </Card>
  )
}
