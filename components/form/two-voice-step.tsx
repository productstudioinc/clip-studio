import { ElevenlabsVoice, generateTextVoiceover } from '@/actions/elevenlabs'
import { VideoProps } from '@/stores/templatestore'
import { Pause, Play } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'

type TwoVoiceStepProps = {
  form: UseFormReturn<VideoProps>
  voices: ElevenlabsVoice[]
}

export const TwoVoiceStep: React.FC<TwoVoiceStepProps> = ({ form, voices }) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>(
    {}
  )

  const { isPending, execute, data } = useServerAction(generateTextVoiceover)

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
        if (audioRef.current) {
          audioRef.current.pause()
        }
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

  const handleGenerate = async () => {
    const senderVoiceId = form.getValues('sender.voiceId')
    const receiverVoiceId = form.getValues('receiver.voiceId')
    const messages = form.getValues('messages')

    const [data, error] = await execute({
      senderVoiceId,
      receiverVoiceId,
      messages
    })

    if (error) {
      toast.error(error.message)
    } else {
      const updatedMessages = messages.map((message, index) => ({
        ...message,
        from: data.sections[index].from,
        duration: data.sections[index].duration
      }))

      form.setValue('messages', updatedMessages)
      form.setValue('voiceoverUrl', data.signedUrl)
      form.setValue('durationInFrames', data.durationInFrames)
      toast.success('Voiceover generated successfully')
    }
  }

  const VoiceSelector = useCallback(
    ({ person }: { person: 'sender' | 'receiver' }) => (
      <FormField
        control={form.control}
        name={`${person}.voiceId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{person === 'sender' ? 'Sender' : 'Receiver'}</FormLabel>
            <FormControl>
              <ScrollArea
                className="h-[300px] p-4 border rounded-md"
                ref={scrollAreaRef}
              >
                <RadioGroup
                  onValueChange={(value) => {
                    const scrollTop = scrollAreaRef.current?.scrollTop
                    field.onChange(value)
                    // Restore scroll position after state update
                    setTimeout(() => {
                      if (scrollAreaRef.current) {
                        scrollAreaRef.current.scrollTop = scrollTop || 0
                      }
                    }, 0)
                  }}
                  defaultValue={field.value}
                  className="space-y-1"
                >
                  {voices.map((voice) => (
                    <Label
                      key={voice.voice_id}
                      htmlFor={`${person}-${voice.voice_id}`}
                      className="flex items-center gap-4 cursor-pointer relative rounded-md border p-2 [&:has([data-state=checked])]:border-primary overflow-hidden"
                    >
                      <RadioGroupItem
                        value={voice.voice_id}
                        id={`${person}-${voice.voice_id}`}
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
                            {playingAudio === voice.voice_id ? 'Pause' : 'Play'}{' '}
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
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    [
      form,
      voices,
      playingAudio,
      progress,
      audioDurations,
      handlePlayPause,
      formatTime
    ]
  )

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Narrator Voices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <VoiceSelector person="sender" />
        <VoiceSelector person="receiver" />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="w-full"
          type="button"
        >
          Generate Voiceover
        </Button>
      </CardFooter>
    </Card>
  )
}
