'use client'

import { useEffect } from 'react'
import {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import { ElevenlabsVoice } from '@/actions/elevenlabs'
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
import { FormErrors } from '@/components/form/form-errors'
import { FormSubmit } from '@/components/form/form-submit'
// import { MusicStep } from '@/components/form/music-step'
import { RedditUrlStep } from '@/components/form/reddit-url-step'
import { TwitterUrlStep } from '@/components/form/twitter-url-step'
import { VideoPreview } from '@/components/form/video-preview'

interface TwitterFormProps {
  voices: ElevenlabsVoice[]
  backgrounds: SelectBackgroundWithParts[]
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
  music: SelectMusic[]
}

export const TwitterForm: React.FC<TwitterFormProps> = ({
  voices,
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
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <TwitterUrlStep form={form} />
            <RedditUrlStep form={form} />
            {/* <VoiceStep form={form} voices={voices} /> */}
            {/* <MusicStep form={form} music={music} /> */}
            <BackgroundSelectStep form={form} backgrounds={backgrounds} />
            <CaptionStyleStep form={form} />
            <AspectRatioStep form={form} />
            <FormErrors form={form} />
            <FormSubmit
              form={form}
              youtubeChannels={youtubeChannels}
              tiktokAccounts={tiktokAccounts}
            />
          </div>

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
