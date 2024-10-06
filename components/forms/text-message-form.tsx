'use client'

import { useEffect } from 'react'
import {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import { ElevenlabsVoice } from '@/actions/elevenlabs'
import { SelectBackgroundWithParts, SelectMusic } from '@/db/schema'
import {
  defaultTextMessageProps,
  TextMessageVideoProps,
  TextMessageVideoSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { BackgroundSelectStep } from '@/components/form/background-select-step'
import { FormErrors } from '@/components/form/form-errors'
import { FormSubmit } from '@/components/form/form-submit'
import { TextMessageStep } from '@/components/form/text-message-step'
import { VideoPreview } from '@/components/form/video-preview'
import { TextMessage } from '@/components/text-message'

import { TwoVoiceStep } from '../form/two-voice-step'

interface TextMessageFormProps {
  voices: ElevenlabsVoice[]
  backgrounds: SelectBackgroundWithParts[]
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
  music: SelectMusic[]
}

export const TextMessageForm: React.FC<TextMessageFormProps> = ({
  voices,
  backgrounds,
  youtubeChannels,
  tiktokAccounts,
  music
}) => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(TextMessageVideoSchema),
    defaultValues: defaultTextMessageProps
  })
  const setTextMessageState = useTemplateStore(
    (state) => state.setTextMessageState
  )

  // Add this effect to update the store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setTextMessageState(value as Partial<TextMessageVideoProps>)
    })
    return () => subscription.unsubscribe()
  }, [form, setTextMessageState])

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5 space-y-6">
            <TextMessageStep form={form} />
            {/* <VoiceStep form={form} voices={voices} /> */}
            <TwoVoiceStep form={form} voices={voices} />
            {/* <MusicStep form={form} music={music} /> */}
            <BackgroundSelectStep form={form} backgrounds={backgrounds} />
            {/* <CaptionStyleStep form={form} /> */}
            <AspectRatioStep form={form} />
            <FormErrors form={form} />
            <FormSubmit
              form={form}
              youtubeChannels={youtubeChannels}
              tiktokAccounts={tiktokAccounts}
            />
          </div>

          <div className="w-full lg:w-2/5">
            <div className="sticky top-8 w-full py-8 flex items-center justify-center p-4 lg:p-0 flex-col">
              <div className="w-full">
                <TextMessage {...(form.watch() as TextMessageVideoProps)} />
              </div>
              <VideoPreview form={form} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
