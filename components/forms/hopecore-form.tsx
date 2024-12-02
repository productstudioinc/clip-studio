'use client'

import { useEffect } from 'react'
import {
  defaultHopeCoreProps,
  HopeCoreVideoProps,
  HopeCoreVideoSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { BackgroundSelectStep } from '@/components/form/background-select-step'
import { CaptionStyleStep } from '@/components/form/caption-style-step'
import { FormSubmit } from '@/components/form/form-submit'
import { HopeCoreContentStep } from '@/components/form/hopecore-content-step'
import { HopecoreVoiceStep } from '@/components/form/hopecore-voice-step'
import { MusicStep } from '@/components/form/music-step'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

interface HopeCoreFormProps {}

export const HopeCoreForm: React.FC<HopeCoreFormProps> = () => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(HopeCoreVideoSchema),
    defaultValues: defaultHopeCoreProps
  })

  const setHopeCoreState = useTemplateStore((state) => state.setHopeCoreState)

  const formValues = useWatch({
    control: form.control
  })

  useEffect(() => {
    setHopeCoreState(formValues as Partial<HopeCoreVideoProps>)
  }, [formValues, setHopeCoreState])

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <HopeCoreContentStep form={form} />
            <HopecoreVoiceStep form={form} />
            <MusicStep form={form} />
            <BackgroundSelectStep form={form} />
            <CaptionStyleStep form={form} />
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
