'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAppContext } from '@/contexts/app-context'
import { VideoProps } from '@/stores/templatestore'
import { Pause, Play, VolumeX } from 'lucide-react'
import { UseFormReturn, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Slider } from '@/components/ui/slider'

type MusicStepProps = {
  form: UseFormReturn<VideoProps>
}

const DEFAULT_MUSIC_VOLUME = 30

export const MusicStep: React.FC<MusicStepProps> = ({ form }) => {
  const { music } = useAppContext()
  const [playing, setPlaying] = useState<string | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [durations, setDurations] = useState<Record<string, number>>({})
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const musicVolume = useWatch({
    control: form.control,
    name: 'musicVolume',
    defaultValue: DEFAULT_MUSIC_VOLUME
  })

  const selectedMusic = useWatch({
    control: form.control,
    name: 'musicUrl'
  })

  const handleAudioPlay = useCallback(
    (audioUrl: string) => {
      if (playing === audioUrl) {
        audioRef.current?.pause()
        setPlaying(null)
        clearInterval(progressInterval.current!)
      } else {
        audioRef.current?.pause()
        clearInterval(progressInterval.current!)

        setPlaying(audioUrl)
        setProgress((prev) => ({ ...prev, [audioUrl]: 0 }))

        const selectedMusic = music.find((m) => m.audioUrl === audioUrl)
        if (!selectedMusic || !selectedMusic.audioUrl) {
          console.error('Selected music not found or missing audioUrl')
          return
        }

        const audio = new Audio(audioUrl)
        audio.volume = musicVolume / 100
        audioRef.current = audio

        audio.addEventListener('loadedmetadata', () => {
          setDurations((prev) => ({ ...prev, [audioUrl]: audio.duration }))
          audio.play().catch((error) => {
            console.error('Could not play audio:', error)
            setPlaying(null)
          })

          progressInterval.current = setInterval(() => {
            if (audio.duration) {
              const currentProgress = (audio.currentTime / audio.duration) * 100
              setProgress((prev) => ({
                ...prev,
                [audioUrl]: currentProgress
              }))

              if (audio.currentTime >= audio.duration) {
                clearInterval(progressInterval.current!)
                setPlaying(null)
                setProgress((prev) => ({ ...prev, [audioUrl]: 0 }))
              }
            }
          }, 50)
        })

        audio.addEventListener('error', (error) => {
          console.error('Error loading audio metadata:', error)
          setPlaying(null)
        })
      }
    },
    [playing, music, musicVolume]
  )

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      clearInterval(progressInterval.current!)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100
    }
  }, [musicVolume])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Background Music</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] p-4 mt-4 border rounded-md">
          <FormField
            control={form.control}
            name="musicUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-1"
                  >
                    {music.map((m) => (
                      <Label
                        key={m.audioUrl}
                        htmlFor={m.audioUrl}
                        className="relative flex-shrink-0 hover:cursor-pointer flex flex-row items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary gap-2"
                      >
                        <RadioGroupItem
                          value={m.audioUrl}
                          id={m.audioUrl}
                          className="sr-only"
                        />
                        <div className="absolute inset-0 w-full h-full bg-secondary/40 pointer-events-none">
                          <div
                            className="h-full bg-secondary transition-all duration-100 ease-in-out"
                            style={{
                              width: `${playing === m.audioUrl ? progress[m.audioUrl] || 0 : 0}%`
                            }}
                          />
                        </div>
                        <div className="flex-shrink-0 relative z-10">
                          {m.audioUrl ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              size="icon"
                              onClick={() => handleAudioPlay(m.audioUrl)}
                            >
                              {playing === m.audioUrl ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {playing === m.audioUrl ? 'Pause' : 'Play'}{' '}
                                {m.name}
                              </span>
                            </Button>
                          ) : (
                            <VolumeX className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-grow relative z-10">
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-sm text-muted-foreground block">
                            {m.description}
                          </span>
                        </div>
                        <div className="flex flex-col items-end relative z-10">
                          <span className="text-sm text-muted-foreground">
                            {playing === m.audioUrl
                              ? durations[m.audioUrl]
                                ? `${formatTime(Math.floor(audioRef.current?.currentTime || 0))} / ${formatTime(durations[m.audioUrl])}`
                                : 'Loading...'
                              : durations[m.audioUrl]
                                ? formatTime(durations[m.audioUrl])
                                : '0:00'}
                          </span>
                        </div>
                        {m.audioUrl && (
                          <audio id={`audio-${m.audioUrl}`} src={m.audioUrl} />
                        )}
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </ScrollArea>
        <div className="space-y-2 mt-4">
          <FormField
            control={form.control}
            name="musicVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Music Volume</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={100}
                      step={10}
                      disabled={selectedMusic === 'none'}
                      className="flex-grow"
                    />
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {field.value}%
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
