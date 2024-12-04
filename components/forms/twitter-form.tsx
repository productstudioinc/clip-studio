'use client'

import React, { useEffect } from 'react'
import {
  defaultTwitterProps,
  TwitterVideoProps,
  TwitterVideoSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { BackgroundSelectStep } from '@/components/form/background-select-step'
import { FormSubmit } from '@/components/form/form-submit'
// import { MusicStep } from '@/components/form/music-step'
import { TwitterUrlStep } from '@/components/form/twitter-url-step'
import TwitterVoiceStep from '@/components/form/twitter-voice-step'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

interface TwitterFormProps {}

export const TwitterForm: React.FC<TwitterFormProps> = () => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(TwitterVideoSchema),
    defaultValues: defaultTwitterProps
  })

  const setTwitterState = useTemplateStore((state) => state.setTwitterState)

  const formValues = useWatch({
    control: form.control
  })

  useEffect(() => {
    setTwitterState(formValues as Partial<TwitterVideoProps>)
  }, [formValues, setTwitterState])

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <TwitterUrlStep form={form} />
            {/* <MusicStep form={form} music={music} /> */}
            <TwitterVoiceStep form={form} />
            <BackgroundSelectStep form={form} />
            <AspectRatioStep form={form} />
            <FormSubmit form={form} />
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
