'use client'

import { useEffect } from 'react'
import {
  AIVideoProps,
  AIVideoSchema,
  defaultAIVideoProps,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AIVoiceStep } from '@/components/form/ai-voice-step'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { CaptionStyleStep } from '@/components/form/caption-style-step'
import { FormSubmit } from '@/components/form/form-submit'
import { ImageGenStep } from '@/components/form/image-gen-step'
import { PromptStep } from '@/components/form/prompt-step'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

interface AIVideoFormProps {}

export const AIVideoForm: React.FC<AIVideoFormProps> = () => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(AIVideoSchema),
    defaultValues: defaultAIVideoProps
  })

  const setAIVideoState = useTemplateStore((state) => state.setAIVideoState)

  const formValues = useWatch({
    control: form.control
  })

  useEffect(() => {
    setAIVideoState(formValues as Partial<AIVideoProps>)
  }, [formValues, setAIVideoState])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <PromptStep form={form} />
            {/* <TranscribeStep form={form} /> */}
            {/* <BackgroundSelectStep form={form} backgrounds={backgrounds} /> */}
            <ImageGenStep form={form} />
            <AIVoiceStep form={form} />
            <CaptionStyleStep form={form} />
            {/* <MusicStep form={form} music={music} /> */}
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
