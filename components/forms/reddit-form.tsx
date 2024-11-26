'use client'

import { useEffect } from 'react'
import {
  defaultRedditProps,
  RedditVideoProps,
  RedditVideoSchema,
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
// import { MusicStep } from '@/components/form/music-step'
import { RedditUrlStep } from '@/components/form/reddit-url-step'
import { RedditVoiceStep } from '@/components/form/reddit-voice-step'
import { VideoPreview } from '@/components/form/video-preview'
import { NumberedSteps } from '@/components/numbered-steps'

interface RedditFormProps {}
export const RedditForm: React.FC<RedditFormProps> = () => {
  const form = useForm<VideoProps>({
    resolver: zodResolver(RedditVideoSchema),
    defaultValues: defaultRedditProps
  })

  const setRedditState = useTemplateStore((state) => state.setRedditState)

  const formValues = useWatch({
    control: form.control
  })

  useEffect(() => {
    setRedditState(formValues as Partial<RedditVideoProps>)
  }, [formValues, setRedditState])

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <div className="grid grid-cols-12 gap-8">
          <NumberedSteps className="col-span-12 lg:col-span-7 space-y-6">
            <RedditUrlStep form={form} />
            <RedditVoiceStep form={form} />
            {/* <MusicStep form={form} music={music} /> */}
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
