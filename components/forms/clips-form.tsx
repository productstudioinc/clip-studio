'use client'

import { useEffect } from 'react'
import {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import { ElevenlabsVoice } from '@/actions/elevenlabs'
import { SelectBackgroundWithParts, SelectMusic } from '@/db/schema'
import {
  ClipsVideoProps,
  ClipsVideoSchema,
  defaultClipsProps,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { CaptionStyleStep } from '@/components/form/caption-style-step'
import { FormErrors } from '@/components/form/form-errors'
import { FormSubmit } from '@/components/form/form-submit'
import { TextStep } from '@/components/form/text-step'
import { UploadStep } from '@/components/form/upload-step'
import { VideoPreview } from '@/components/form/video-preview'

interface ClipsFormProps {
  voices: ElevenlabsVoice[]
  backgrounds: SelectBackgroundWithParts[]
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
  music: SelectMusic[]
}

export const ClipsForm: React.FC<ClipsFormProps> = ({
  voices,
  backgrounds,
  youtubeChannels,
  tiktokAccounts,
  music
}) => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(ClipsVideoSchema),
    defaultValues: defaultClipsProps
  })

  const setClipsState = useTemplateStore((state) => state.setClipsState)

  // Add this effect to update the store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setClipsState(value as Partial<ClipsVideoProps>)
    })
    return () => subscription.unsubscribe()
  }, [form, setClipsState])

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5 space-y-6">
            <UploadStep form={form} />
            <TextStep form={form} />
            <CaptionStyleStep form={form} />
            <AspectRatioStep form={form} />
            <FormErrors form={form} />
            <FormSubmit
              form={form}
              youtubeChannels={youtubeChannels}
              tiktokAccounts={tiktokAccounts}
            />
          </div>

          <div className="w-full lg:w-2/5">
            <div className="sticky top-8 flex items-center justify-center">
              <VideoPreview form={form} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
