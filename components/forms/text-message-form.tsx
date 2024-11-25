'use client'

import { useEffect } from 'react'
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
import { FormSubmit } from '@/components/form/form-submit'
import { TextMessageStep } from '@/components/form/text-message-step'
import { TwoVoiceStep } from '@/components/form/two-voice-step'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

interface TextMessageFormProps {}

export const TextMessageForm: React.FC<TextMessageFormProps> = () => {
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
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <TextMessageStep form={form} />
            {/* <VoiceStep form={form} voices={voices} /> */}
            <TwoVoiceStep form={form} />
            {/* <MusicStep form={form} music={music} /> */}
            <BackgroundSelectStep form={form} />
            {/* <CaptionStyleStep form={form} /> */}
            <AspectRatioStep form={form} />
            <FormSubmit form={form} />
          </NumberedSteps>

          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-8 w-full py-8 flex items-center justify-center p-4 lg:p-0 flex-col">
              <VideoPreview form={form} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
