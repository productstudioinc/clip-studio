'use client'

import { useEffect } from 'react'
import {
  defaultSplitScreenProps,
  SplitScreenVideoProps,
  SplitScreenVideoSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { BackgroundSelectStep } from '@/components/form/background-select-step'
import { FormSubmit } from '@/components/form/form-submit'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

import { CaptionStyleStep } from '../form/caption-style-step'
import { TranscribeStep } from '../form/transcribe-step'
import { UploadStep } from '../form/upload-step'

interface SplitScreenFormProps {}

export const SplitScreenForm: React.FC<SplitScreenFormProps> = () => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(SplitScreenVideoSchema),
    defaultValues: defaultSplitScreenProps
  })

  const setSplitScreenState = useTemplateStore(
    (state) => state.setSplitScreenState
  )

  const formValues = useWatch({
    control: form.control
  })

  useEffect(() => {
    setSplitScreenState(formValues as Partial<SplitScreenVideoProps>)
  }, [formValues, setSplitScreenState])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <UploadStep form={form} />
            <TranscribeStep form={form} />
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
