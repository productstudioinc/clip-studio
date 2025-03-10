'use client'

import React, { useState } from 'react'
import { getTranscription, getTranscriptionId } from '@/actions/transcribe'
import { VideoProps } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { Loader2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

type TranscribeStepProps = {
  form: UseFormReturn<VideoProps>
}

export const TranscribeStep: React.FC<TranscribeStepProps> = ({ form }) => {
  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleTranscriptionChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newTranscription = [...form.getValues('transcription')]
    newTranscription[index] = {
      ...newTranscription[index],
      [field]: field.includes('Ms') ? Number(value) : value
    }
    form.setValue('transcription', newTranscription)
  }

  const msToTimestamp = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const timestampToMs = (timestamp: string) => {
    const [minutes, seconds] = timestamp.split(':').map(Number)
    return (minutes * 60 + seconds) * 1000
  }

  const handleTranscribeClick = async () => {
    setIsTranscribing(true)
    const videoUrl = form.getValues('videoUrl')

    if (!videoUrl) {
      toast.error('No video URL found. Please ensure a video is selected.')
      setIsTranscribing(false)
      return
    }

    const [transcriptionData, transcriptionIdErr] =
      await getTranscriptionId(videoUrl)

    if (transcriptionIdErr) {
      toast.error(transcriptionIdErr.message)
      setIsTranscribing(false)
    } else {
      toast.success('Extracted audio, generating transcription...')
      form.setValue('transcriptionId', transcriptionData.callId)

      const checkTranscription = async () => {
        const [transcription, transcriptionErr] =
          await getTranscription(transcriptionData)

        if (transcriptionErr) {
          toast.error(transcriptionErr.message)
          setIsTranscribing(false)
        } else if (transcription.status === 'processing') {
          setTimeout(checkTranscription, 5000)
        } else if (transcription.status === 'done') {
          toast.success('Transcription generated!')
          setIsTranscribing(false)
          form.setValue('transcription', transcription.data as any)
        }
      }

      checkTranscription()
    }
  }

  const renderTranscription = () => {
    const transcription = form.getValues('transcription')
    if (!transcription) return null

    return (
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <div className="p-4">
          <div className="mb-2 grid grid-cols-[100px_100px_1fr] gap-2 font-semibold">
            <div>Start</div>
            <div>End</div>
            <div>Transcription</div>
          </div>
          <ul className="space-y-3">
            {transcription.map((segment, index) => (
              <li
                key={index}
                className="grid grid-cols-[100px_100px_1fr] gap-2 items-center"
              >
                <div className="flex items-center space-x-2">
                  <Input
                    value={msToTimestamp(segment.startMs)}
                    onChange={(e) =>
                      handleTranscriptionChange(
                        index,
                        'startMs',
                        timestampToMs(e.target.value)
                      )
                    }
                    className="w-full"
                    placeholder="00:00"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={msToTimestamp(segment.endMs)}
                    onChange={(e) =>
                      handleTranscriptionChange(
                        index,
                        'endMs',
                        timestampToMs(e.target.value)
                      )
                    }
                    className="w-full"
                    placeholder="00:00"
                  />
                </div>
                <Input
                  value={segment.text}
                  onChange={(e) =>
                    handleTranscriptionChange(index, 'text', e.target.value)
                  }
                  className="w-full"
                  placeholder="Transcription text"
                />
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Video Transcription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          disabled={isTranscribing || !form.getValues('videoUrl')}
          onClick={handleTranscribeClick}
        >
          {isTranscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isTranscribing ? (
            'Transcribing...'
          ) : (
            <>
              Start Transcription{' '}
              <span className="text-muted-foreground ml-1">
                ~{' '}
                {Math.ceil(
                  form.getValues('durationInFrames') /
                    30 /
                    CREDIT_CONVERSIONS.TRANSCRIBE_SECONDS
                )}{' '}
                credits
              </span>
            </>
          )}
        </Button>
        {renderTranscription()}
      </CardContent>
    </Card>
  )
}
