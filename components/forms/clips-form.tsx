'use client'

import { useEffect } from 'react'
import {
  ClipsVideoProps,
  ClipsVideoSchema,
  defaultClipsProps,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { CaptionStyleStep } from '@/components/form/caption-style-step'
import { FormSubmit } from '@/components/form/form-submit'
import { TextStep } from '@/components/form/text-step'
import { UploadStep } from '@/components/form/upload-step'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

interface ClipsFormProps {}

export const ClipsForm: React.FC<ClipsFormProps> = () => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(ClipsVideoSchema),
    defaultValues: defaultClipsProps
  })

  const setClipsState = useTemplateStore((state) => state.setClipsState)

  const formValues = useWatch({
    control: form.control
  })

  useEffect(() => {
    setClipsState(formValues as Partial<ClipsVideoProps>)
  }, [formValues, setClipsState])

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <UploadStep form={form} />
            <TextStep form={form} />
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
