'use client'

import React, { useState } from 'react'
import { generatePresignedUrl } from '@/actions/generate-presigned-urls'
import { VideoProps } from '@/stores/templatestore'
import { getVideoMetadata } from '@remotion/media-utils'
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

interface UploadStepProps {
  form: UseFormReturn<VideoProps>
}

export const UploadStep: React.FC<UploadStepProps> = ({ form }) => {
  const { setValue, watch } = form
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleClearPreview = () => {
    setPreviewUrl(null)
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files === null) {
      return
    }

    const file = event.target.files[0]

    const MAX_FILE_SIZE = 200 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 200mb')
      return
    }

    setIsUploading(true)

    try {
      const blobUrl = URL.createObjectURL(file)
      setPreviewUrl(blobUrl)

      setValue('type', 'blob')
      setValue('videoUrl', blobUrl)

      const contentType = file.type || 'application/octet-stream'
      const arrayBuffer = await file.arrayBuffer()
      const contentLength = arrayBuffer.byteLength

      const [data, err] = await generatePresignedUrl({
        contentType: contentType,
        contentLength: contentLength,
        filename: file.name,
        tags: ['Video']
      })

      if (err) {
        throw new Error(err.message)
      }

      await fetch(data.uploadUrl, {
        method: 'PUT',
        body: arrayBuffer,
        headers: {
          'Content-Type': contentType
        }
      })

      const { durationInSeconds } = await getVideoMetadata(data.publicUrl)

      setValue('type', 'cloud')
      setValue('videoUrl', data.publicUrl)
      setValue('durationInFrames', Math.floor(durationInSeconds * 30))
      setValue('transcriptionId', '')
      setValue('transcription', [])

      URL.revokeObjectURL(blobUrl)
      toast.success('Video uploaded successfully')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred during upload'
      )
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Video</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {previewUrl ? (
                  <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      id="preview-video"
                      src={previewUrl}
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
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="video-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/40"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MP4 or WebM (MAX. 200mb)
                        </p>
                      </div>
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </Label>
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
