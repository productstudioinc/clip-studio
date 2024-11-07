'use client'

import React, { useEffect } from 'react'
import {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import { ElevenlabsLibraryVoice, ElevenlabsVoice } from '@/actions/elevenlabs'
import { SelectBackgroundWithParts, SelectMusic } from '@/db/schema'
import {
  defaultTwitterProps,
  TwitterVideoProps,
  TwitterVideoSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { BackgroundSelectStep } from '@/components/form/background-select-step'
import { CaptionStyleStep } from '@/components/form/caption-style-step'
import { FormSubmit } from '@/components/form/form-submit'
// import { MusicStep } from '@/components/form/music-step'
import { TwitterUrlStep } from '@/components/form/twitter-url-step'
import TwitterVoiceStep from '@/components/form/twitter-voice-step'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

interface TwitterFormProps {
  voices: ElevenlabsVoice[]
  libraryVoices: ElevenlabsLibraryVoice[]
  backgrounds: SelectBackgroundWithParts[]
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
  music: SelectMusic[]
}

export const TwitterForm: React.FC<TwitterFormProps> = ({
  voices,
  libraryVoices,
  backgrounds,
  youtubeChannels,
  tiktokAccounts,
  music
}) => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(TwitterVideoSchema),
    defaultValues: defaultTwitterProps
  })

  const setTwitterState = useTemplateStore((state) => state.setTwitterState)

  // Add this effect to update the store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setTwitterState(value as Partial<TwitterVideoProps>)
    })
    return () => subscription.unsubscribe()
  }, [form, setTwitterState])

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <TwitterUrlStep form={form} />
            {/* <VoiceStep form={form} voices={voices} /> */}
            {/* <MusicStep form={form} music={music} /> */}
            <TwitterVoiceStep
              form={form}
              voices={voices}
              libraryVoices={libraryVoices}
            />
            <BackgroundSelectStep form={form} backgrounds={backgrounds} />
            <CaptionStyleStep form={form} />
            <AspectRatioStep form={form} />
            <FormSubmit
              form={form}
              youtubeChannels={youtubeChannels}
              tiktokAccounts={tiktokAccounts}
            />
          </NumberedSteps>

          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-8 flex items-center justify-center">
              <VideoPreview form={form} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
