'use client'

import {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import { ElevenlabsVoice } from '@/actions/elevenlabs'
import { SelectBackgroundWithParts } from '@/db/schema'
import {
  defaultSplitScreenProps,
  SplitScreenVideoProps,
  SplitScreenVideoSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { BackgroundSelectStep } from '@/components/form/background-select-step'
import { FormErrors } from '@/components/form/form-errors'
import { FormSubmit } from '@/components/form/form-submit'
import { VideoPreview } from '@/components/form/video-preview'
import { Form } from '@/components/ui/form'

import { CaptionStyleStep } from '../form/caption-style-step'
import { TranscribeStep } from '../form/transcribe-step'
import { UploadStep } from '../form/upload-step'

interface SplitScreenFormProps {
  voices: ElevenlabsVoice[]
  backgrounds: SelectBackgroundWithParts[]
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
}

export const SplitScreenForm: React.FC<SplitScreenFormProps> = ({
  backgrounds,
  youtubeChannels,
  tiktokAccounts
}) => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(SplitScreenVideoSchema),
    defaultValues: defaultSplitScreenProps
  })

  const setSplitScreenState = useTemplateStore(
    (state) => state.setSplitScreenState
  )

  // Add this effect to update the store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setSplitScreenState(value as Partial<SplitScreenVideoProps>)
    })
    return () => subscription.unsubscribe()
  }, [form, setSplitScreenState])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <UploadStep form={form} />
            <TranscribeStep form={form} />
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
