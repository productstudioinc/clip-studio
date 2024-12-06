'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAppContext } from '@/contexts/app-context'
import { Language, LanguageFlags, VideoProps } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import {
  CaretSortIcon,
  CheckIcon,
  QuestionMarkIcon
} from '@radix-ui/react-icons'
import { Loader2, Pause, Play } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

import { useRedditVoiceoverGeneration } from '@/lib/hooks/use-reddit-voiceover-generation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

type RedditVoiceStepProps = {
  form: UseFormReturn<VideoProps>
}

export const RedditVoiceStep: React.FC<RedditVoiceStepProps> = ({ form }) => {
  const { voices } = useAppContext()
  const { generateVoiceover, isGeneratingVoiceover: isPending } =
    useRedditVoiceoverGeneration(form)

  const languages = Object.entries(Language).map(([key, value]) => ({
    value,
    label: key,
    flag: LanguageFlags[value as Language]
  }))
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const originalDurationRef = useRef<number | null>(null)
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>(
    {}
  )

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
        // Pause the current audio
        audioRef.current?.pause()
        setPlayingAudio(null)
        clearInterval(progressInterval.current!)
        setProgress(0)
      } else {
        // Stop any currently playing audio
        audioRef.current?.pause()
        clearInterval(progressInterval.current!)

        // Play the new audio
        setPlayingAudio(voiceId)
        setProgress(0)
        audioRef.current = new Audio(previewUrl)
        audioRef.current.volume = 0.4

        const speed = form.getValues('voiceSpeed') || 1
        audioRef.current.playbackRate = speed

        // Use a user interaction to trigger audio playback
        audioRef.current.play().catch((error) => {
          console.error('Could not play audio:', error)
          setPlayingAudio(null)
        })

        // Simulate progress only if play() was successful
        if (audioRef.current.paused === false) {
          simulateProgress(audioDurations[voiceId] / speed)
        }
      }
    },
    [playingAudio, audioDurations, form]
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

  const getAudioElementId = (id: string) => id + '-audio'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Narrator Voice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Language</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between flex items-center',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          <>
                            <span className="mr-2 text-2xl">
                              {
                                languages.find(
                                  (lang) => lang.value === field.value
                                )?.flag
                              }
                            </span>
                            {
                              languages.find(
                                (lang) => lang.value === field.value
                              )?.label
                            }
                          </>
                        ) : (
                          'Select language'
                        )}
                        <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search language..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          {languages.map((language) => (
                            <CommandItem
                              value={language.label}
                              key={language.value}
                              onSelect={() => {
                                form.setValue('language', language.value)
                              }}
                            >
                              <span className="mr-2 text-2xl">
                                {language.flag}
                              </span>
                              {language.label}
                              <CheckIcon
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  language.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  This is the language that will be used in the video.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voiceSpeed"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Voice Speed</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const newSpeed = parseFloat(value)
                    field.onChange(newSpeed)

                    const currentDurationInFrames =
                      form.getValues('durationInFrames')
                    if (currentDurationInFrames) {
                      if (originalDurationRef.current === null) {
                        originalDurationRef.current = currentDurationInFrames
                      }

                      const newDuration = Math.floor(
                        originalDurationRef.current! / newSpeed
                      )
                      form.setValue('durationInFrames', newDuration)
                    }
                  }}
                  value={field.value?.toString() || '1'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">Slow (0.5x)</SelectItem>
                    <SelectItem value="0.9">Slow (0.75x)</SelectItem>
                    <SelectItem value="1">Normal (1x)</SelectItem>
                    <SelectItem value="1.1">Fast (1.1x)</SelectItem>
                    <SelectItem value="1.25">Fast (1.25x)</SelectItem>
                    <SelectItem value="1.5">Fast (1.5x)</SelectItem>
                    <SelectItem value="1.75">Fast (1.75x)</SelectItem>
                    <SelectItem value="2">Fast (2x)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Adjust the playback speed of the voice
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <ScrollArea className="h-[300px] p-4 mt-4 border rounded-md">
          <FormField
            control={form.control}
            name="voice"
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
                        <audio
                          id={getAudioElementId(voice.voice_id)}
                          src={voice.preview_url}
                        />
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
            name="voiceVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice Volume</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={100}
                      step={10}
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
        <div className="mt-6 flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={generateVoiceover}
                  disabled={isPending || !form.getValues('voice')}
                  className="flex-grow"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Generate Voiceover{' '}
                  <span className="text-muted-foreground ml-1">
                    ~{' '}
                    {Math.ceil(
                      form.getValues('text').length /
                        CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
                    )}{' '}
                    credits
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a voiceover preview for your video</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full" size="icon">
                <QuestionMarkIcon className="h-4 w-4" />
                <span className="sr-only">Open popover</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <p className="text-sm text-muted-foreground">
                Generating a voiceover will give you a preview of the voiceover
                for your video based on the text you enter.
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}
