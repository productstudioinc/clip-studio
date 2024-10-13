'use client'

import { useEffect } from 'react'
import {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import { ElevenlabsVoice } from '@/actions/elevenlabs'
import { SelectBackgroundWithParts, SelectMusic } from '@/db/schema'
import {
  AIVideoProps,
  AIVideoSchema,
  defaultAIVideoProps,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AIVoiceStep } from '@/components/form/ai-voice-step'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { CaptionStyleStep } from '@/components/form/caption-style-step'
import { FormErrors } from '@/components/form/form-errors'
import { FormSubmit } from '@/components/form/form-submit'
import { ImageGenStep } from '@/components/form/image-gen-step'
import { PromptStep } from '@/components/form/prompt-step'
import { VideoPreview } from '@/components/form/video-preview'

interface AIVideoFormProps {
  voices: ElevenlabsVoice[]
  backgrounds: SelectBackgroundWithParts[]
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
  music: SelectMusic[]
}

export const AIVideoForm: React.FC<AIVideoFormProps> = ({
  youtubeChannels,
  tiktokAccounts,
  voices
}) => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(AIVideoSchema),
    defaultValues: defaultAIVideoProps
  })

  const setAIVideoState = useTemplateStore((state) => state.setAIVideoState)

  // Add this effect to update the store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setAIVideoState(value as Partial<AIVideoProps>)
    })
    return () => subscription.unsubscribe()
  }, [form, setAIVideoState])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <PromptStep form={form} />
            {/* <TranscribeStep form={form} /> */}
            {/* <BackgroundSelectStep form={form} backgrounds={backgrounds} /> */}
            <ImageGenStep form={form} />
            <AIVoiceStep form={form} voices={voices} />
            <CaptionStyleStep form={form} />
            {/* <MusicStep form={form} music={music} /> */}
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
