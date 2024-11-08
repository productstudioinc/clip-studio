'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ElevenlabsLibraryVoice,
  ElevenlabsVoice,
  generateTwitterVoiceover,
  getVoice
} from '@/actions/elevenlabs'
import { Language, LanguageFlags, VideoProps } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import {
  CaretSortIcon,
  CheckIcon,
  QuestionMarkCircledIcon
} from '@radix-ui/react-icons'
import { Voice } from 'elevenlabs/api'
import { Loader2, Mic2, Pause, Play } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TwitterVoiceStepProps = {
  form: UseFormReturn<VideoProps>
  voices: ElevenlabsVoice[]
  customVoice: ElevenlabsLibraryVoice[]
}

export default function TwitterVoiceStep({
  form,
  voices
}: TwitterVoiceStepProps) {
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
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>(
    {}
  )
  const { isPending, execute } = useServerAction(generateTwitterVoiceover)
  const { isPending: isPendingCustomVoice, execute: executeCustomVoice } =
    useServerAction(getVoice)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const [customVoice, setCustomVoice] = useState<Voice | null>(null)

  const tweets = form.watch('tweets')
  const uniqueUsernames = Array.from(
    new Set(tweets.map((tweet) => tweet.username))
  )

  useEffect(() => {
    if (uniqueUsernames.length > 0 && !selectedUser) {
      setSelectedUser(uniqueUsernames[0])
    }
  }, [uniqueUsernames, selectedUser])

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

        const speed = form.getValues('voiceSpeed') || 1

        audioRef.current.playbackRate = speed

        audioRef.current.play().catch((error) => {
          console.error('Could not play audio:', error)
          setPlayingAudio(null)
        })

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

  const handleGetVoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const voiceUrl = e.target.value
    if (!voiceUrl) return

    const id = voiceUrl.split('/').pop()
    if (!id) return

    const [data, err] = await executeCustomVoice({
      id
    })
    if (err) {
      toast.error(err.message)
    } else {
      toast.success('Voice fetched successfully')
      if (!selectedUser) {
        toast.error('Please select a user')
        return
      }

      const currentSettings = form.getValues('voiceSettings') || []
      const userIndex = currentSettings.findIndex(
        (s) => s.username === selectedUser
      )
      const newSettings = [...currentSettings]
      if (userIndex >= 0) {
        newSettings[userIndex] = {
          username: selectedUser,
          voiceId: data.voice_id
        }
      } else {
        newSettings.push({
          username: selectedUser,
          voiceId: data.voice_id
        })
      }
      form.setValue('voiceSettings', newSettings)
      setCustomVoice(data)

      // Setup audio duration for the custom voice
      if (data.preview_url) {
        const duration = await getDuration(data.preview_url)
        setAudioDurations((prev) => ({ ...prev, [data.voice_id]: duration }))
      }
    }
  }

  const handleGenerateVoiceover = async () => {
    const language = form.getValues('language')
    const voiceSettings = form.getValues('voiceSettings') || []
    const voiceSpeed = form.getValues('voiceSpeed') || 1
    if (voiceSettings.length !== uniqueUsernames.length) {
      toast.error('Please assign a voice to each username')
      return
    }

    const hasEmptyVoiceId = voiceSettings.some((setting) => !setting.voiceId)
    if (hasEmptyVoiceId) {
      toast.error('Please select a voice for each username')
      return
    }

    const [data, err] = await execute({
      tweets: tweets.map((tweet) => ({
        username: tweet.username,
        content: tweet.content
      })),
      voiceSettings,
      language
    })

    if (err) {
      toast.error(err.message)
      form.setValue('isVoiceoverGenerated', false)
    } else {
      form.setValue('voiceoverUrl', data.signedUrl)
      const updatedVideoStructure = form
        .getValues('tweets')
        .map((segment, index) => ({
          ...segment,
          from: data.sections[index].from,
          duration: data.sections[index].duration
        }))
      form.setValue('tweets', updatedVideoStructure)
      form.setValue('durationInFrames', data.durationInFrames)
      form.setValue('isVoiceoverGenerated', true)

      toast.success('Voiceover generated successfully and added to your video.')
    }
  }

  const totalCharacters = tweets.reduce(
    (sum, tweet) => sum + tweet.content.length,
    0
  )
  const estimatedCredits = Math.ceil(
    totalCharacters / CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS
  )

  const originalDurationRef = useRef<number | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Voices to Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

                    if (originalDurationRef.current === null) {
                      originalDurationRef.current = currentDurationInFrames
                    }

                    const newDuration = originalDurationRef.current! / newSpeed

                    form.setValue('durationInFrames', Math.floor(newDuration))
                  }}
                  value={field.value?.toString() || '1'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Normal (1x)</SelectItem>
                    <SelectItem value="1.5">Faster (1.5x)</SelectItem>
                    <SelectItem value="2">Fastest (2x)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Adjust the playback speed of the voice
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>Select User</FormLabel>
          <Select
            onValueChange={setSelectedUser}
            value={selectedUser || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {uniqueUsernames.map((username) => (
                <SelectItem key={username} value={username}>
                  @{username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
        <Tabs defaultValue="voices">
          <TabsList className="w-full">
            <TabsTrigger value="voices" className="w-full">
              Default Voices
            </TabsTrigger>
            <TabsTrigger value="customVoice" className="w-full">
              Custom Voice
            </TabsTrigger>
          </TabsList>
          <TabsContent value="voices">
            {selectedUser && (
              <FormField
                control={form.control}
                name="voiceSettings"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScrollArea className="h-[400px] border rounded-md">
                        <RadioGroup
                          onValueChange={(voiceId) => {
                            const currentSettings = field.value || []
                            const userIndex = currentSettings.findIndex(
                              (s) => s.username === selectedUser
                            )
                            const newSettings = [...currentSettings]
                            if (userIndex >= 0) {
                              newSettings[userIndex] = {
                                username: selectedUser,
                                voiceId
                              }
                            } else {
                              newSettings.push({
                                username: selectedUser,
                                voiceId
                              })
                            }
                            field.onChange(newSettings)
                          }}
                          value={
                            field.value?.find(
                              (s) => s.username === selectedUser
                            )?.voiceId || ''
                          }
                          className="space-y-1 p-4"
                        >
                          {voices.map((voice) => (
                            <Label
                              key={voice.voice_id}
                              htmlFor={`${selectedUser}-${voice.voice_id}`}
                              className="relative flex-shrink-0 hover:cursor-pointer flex flex-row items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary gap-2"
                            >
                              <RadioGroupItem
                                value={voice.voice_id}
                                id={`${selectedUser}-${voice.voice_id}`}
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
                                    handlePlayPause(
                                      voice.preview_url,
                                      voice.voice_id
                                    )
                                  }}
                                >
                                  {playingAudio === voice.voice_id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <div className="flex-grow relative z-10">
                                <span className="font-semibold">
                                  {voice.name}
                                </span>
                                <span className="text-sm text-muted-foreground block">
                                  {voice.labels &&
                                    Object.values(voice.labels).join(', ')}
                                </span>
                              </div>
                              <div className="flex flex-col items-end relative z-10">
                                <span className="text-sm text-muted-foreground">
                                  {playingAudio === voice.voice_id
                                    ? `${formatTime((progress * audioDurations[voice.voice_id]) / 100)} / ${formatTime(audioDurations[voice.voice_id])}`
                                    : formatTime(
                                        audioDurations[voice.voice_id] || 0
                                      )}
                                </span>
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </ScrollArea>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </TabsContent>
          <TabsContent value="customVoice">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Custom Voices
                  <HoverCard>
                    <HoverCardTrigger>
                      <QuestionMarkCircledIcon className="h-6 w-6" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-[48rem]">
                      <video
                        src="https://assets.clip.studio/custom-voice-demo.mp4"
                        className="w-full"
                        autoPlay
                        muted
                        loop
                      />
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    name="customVoiceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice URL</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="Enter voice URL"
                              className="w-full px-3 py-2 border rounded-md"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            onClick={(e) => {
                              e.preventDefault()
                              handleGetVoice({
                                target: { value: field.value }
                              } as any)
                            }}
                            disabled={isPendingCustomVoice || !field.value}
                          >
                            {isPendingCustomVoice ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Get Voice'
                            )}
                          </Button>
                        </div>
                        <FormDescription>
                          Enter the URL of your custom voice
                        </FormDescription>
                        <FormMessage />
                        {customVoice && (
                          <Label
                            htmlFor={`${selectedUser}-${customVoice.voice_id}`}
                            className="relative flex-shrink-0 hover:cursor-pointer flex flex-row items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary gap-2"
                          >
                            <div className="absolute inset-0 w-full h-full bg-secondary/40 pointer-events-none">
                              <div
                                className="h-full bg-secondary transition-all duration-100 ease-in-out"
                                style={{
                                  width: `${playingAudio === customVoice.voice_id ? progress : 0}%`
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
                                  handlePlayPause(
                                    customVoice.preview_url,
                                    customVoice.voice_id
                                  )
                                }}
                              >
                                {playingAudio === customVoice.voice_id ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="flex-grow relative z-10">
                              <span className="font-semibold">
                                {customVoice.name}
                              </span>
                              <span className="text-sm text-muted-foreground block">
                                {customVoice.description}
                              </span>
                            </div>
                            <div className="flex flex-col items-end relative z-10">
                              <span className="text-sm text-muted-foreground">
                                {playingAudio === customVoice.voice_id
                                  ? `${formatTime(
                                      (progress *
                                        audioDurations[customVoice.voice_id]) /
                                        100
                                    )} / ${formatTime(
                                      audioDurations[customVoice.voice_id]
                                    )}`
                                  : formatTime(
                                      audioDurations[customVoice.voice_id] || 0
                                    )}
                              </span>
                            </div>
                          </Label>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="pt-6 border-t">
          <Button
            onClick={handleGenerateVoiceover}
            disabled={
              isPending ||
              !form.getValues('voiceSettings')?.length ||
              form.getValues('voiceSettings')?.length !== uniqueUsernames.length
            }
            className="w-full"
            type="button"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mic2 className="mr-2 h-4 w-4" />
            )}
            Generate Voiceover
            <span className="text-muted-foreground ml-1">
              ~ {estimatedCredits} credits
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
