'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { generateStructuredVoiceover } from '@/actions/elevenlabs'
import { useAppContext } from '@/contexts/app-context'
import { Language, VIDEO_FPS, VideoProps } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { Loader2, Mic2, Pause, Play } from 'lucide-react'
import { UseFormReturn, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

type AIVoiceStepProps = {
  form: UseFormReturn<VideoProps>
}

export const AIVoiceStep: React.FC<AIVoiceStepProps> = ({ form }) => {
  const { voices } = useAppContext()
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>(
    {}
  )
  const { isPending, execute } = useServerAction(generateStructuredVoiceover)

  useEffect(() => {
    const fetchDurations = async () => {
      const durations: Record<string, number> = {}
      for (const voice of voices) {
        if (voice.preview_url) {
          durations[voice.voice_id] = await getDuration(voice.preview_url)
        }
      }
      setAudioDurations(durations)
    }

    fetchDurations()
  }, [voices])

  const getDuration = (audioUrl: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl)
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration)
      })
      audio.addEventListener('error', () => {
        console.error('Error loading audio:', audio.error)
        resolve(0)
      })
    })
  }

  const handlePlayPause = useCallback(
    (previewUrl: string | undefined, voiceId: string) => {
      if (!previewUrl) return

      if (playingAudio === voiceId) {
        audioRef.current?.pause()
        setPlayingAudio(null)
        clearInterval(progressInterval.current!)
        setProgress(0)
      } else {
        audioRef.current?.pause()
        clearInterval(progressInterval.current!)

        setPlayingAudio(voiceId)
        setProgress(0)
        audioRef.current = new Audio(previewUrl)
        audioRef.current.volume = 0.4

        audioRef.current.play().catch((error) => {
          console.error('Could not play audio:', error)
          setPlayingAudio(null)
        })

        if (audioRef.current.paused === false) {
          simulateProgress(audioDurations[voiceId])
        }
      }
    },
    [playingAudio, audioDurations]
  )

  const simulateProgress = useCallback((duration: number) => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }
    startTimeRef.current = Date.now()
    progressInterval.current = setInterval(() => {
      const elapsedTime = Date.now() - (startTimeRef.current || 0)
      const newProgress = (elapsedTime / (duration * 1000)) * 100
      if (newProgress >= 100) {
        clearInterval(progressInterval.current!)
        setPlayingAudio(null)
        setProgress(0)
      } else {
        setProgress(newProgress)
      }
    }, 50)
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleGenerateVoiceover = async () => {
    const [data, err] = await execute({
      voiceId: form.getValues('voiceId'),
      videoStructure: form.getValues('videoStructure') as any,
      language: Language.English
    })

    if (err) {
      toast.error(err.message)
      form.setValue('isVoiceoverGenerated', false)
    } else {
      form.setValue('voiceoverUrl', data.signedUrl)
      form.setValue('subtitles', data.voiceoverObject)
      form.setValue(
        'durationInFrames',
        Math.floor(data.endTimestamp * VIDEO_FPS)
      )

      // Update videoStructure with segment durations
      const updatedVideoStructure = form
        .getValues('videoStructure')
        .map((segment, index) => ({
          ...segment,
          duration: data.segmentDurations[index]
        }))
      form.setValue('videoStructure', updatedVideoStructure as any)
      form.setValue('isVoiceoverGenerated', true)
      form.clearErrors('isVoiceoverGenerated')

      toast.success(
        'Voiceover generated. The voiceover has been successfully generated and added to your video.'
      )
    }
  }

  const videoStructure = useWatch({
    control: form.control,
    name: 'videoStructure'
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Voiceover</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          {videoStructure.map((section, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`videoStructure.${index}.text`}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Section {index + 1}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      className="resize-none"
                      placeholder={`Enter text for section ${index + 1}`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-4">Choose a Narrator Voice</h3>
        <ScrollArea className="h-[300px] p-4 mt-4 border rounded-md">
          <FormField
            control={form.control}
            name="voiceId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-1"
                  >
                    {voices.map((voice) => (
                      <Label
                        key={voice.voice_id}
                        htmlFor={voice.voice_id}
                        className="relative flex-shrink-0 hover:cursor-pointer flex flex-row items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary gap-2"
                      >
                        <RadioGroupItem
                          value={voice.voice_id}
                          id={voice.voice_id}
                          className="sr-only"
                        />
                        <div className="absolute inset-0 w-full h-full bg-secondary/40 pointer-events-none">
                          <div
                            className="h-full bg-secondary transition-all duration-100 ease-in-out"
                            style={{
                              width: `${playingAudio === voice.voice_id ? progress : 0}%`
                            }}
                          />
                        </div>
                        <div className="flex-shrink-0 relative z-10">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePlayPause(voice.preview_url, voice.voice_id)
                            }}
                          >
                            {playingAudio === voice.voice_id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {playingAudio === voice.voice_id
                                ? 'Pause'
                                : 'Play'}{' '}
                              {voice.name}
                            </span>
                          </Button>
                        </div>
                        <div className="flex-grow relative z-10">
                          <span className="font-semibold">{voice.name}</span>
                          <span className="text-sm text-muted-foreground block">
                            {voice.labels &&
                              Object.values(voice.labels).join(', ')}
                          </span>
                        </div>
                        <div className="flex flex-col items-end relative z-10">
                          <span className="text-sm text-muted-foreground">
                            {playingAudio === voice.voice_id
                              ? `${formatTime((progress * audioDurations[voice.voice_id]) / 100)} / ${formatTime(audioDurations[voice.voice_id])}`
                              : formatTime(audioDurations[voice.voice_id] || 0)}
                          </span>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </ScrollArea>

        <div className="mt-6">
          <Button
            onClick={handleGenerateVoiceover}
            disabled={
              isPending ||
              !form.getValues('voiceId') ||
              form.getValues('videoStructure').length === 0
            }
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mic2 className="mr-2 h-4 w-4" />
            )}
            Generate Voiceover
            <span className="text-muted-foreground ml-1">
              ~{' '}
              {Math.ceil(
                form
                  .getValues('videoStructure')
                  .reduce((acc, curr) => acc + curr.text.length, 0) /
                  CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
              )}{' '}
              credits
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
