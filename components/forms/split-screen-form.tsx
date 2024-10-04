'use client'

import { useEffect } from 'react'
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
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { AspectRatioStep } from '@/components/form/aspect-ratio-step'
import { BackgroundSelectStep } from '@/components/form/background-select-step'
import { FormErrors } from '@/components/form/form-errors'
import { FormSubmit } from '@/components/form/form-submit'
import { VideoPreview } from '@/components/form/video-preview'

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
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5 space-y-6">
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

          <div className="w-full lg:w-2/5">
            <div className="sticky top-0 px-8 h-screen flex items-center justify-center p-4">
              <div className="w-full max-w-md overflow-y-auto">
                <VideoPreview form={form} />
                {/* <Card>
								<CardHeader>
								<CardTitle>Additional Information</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										This section can include more details about the selected options, tips for
										creating split-screen videos, or any other relevant information that might be
										helpful for the user during the video creation process.
										</p>
										</CardContent>
										</Card> */}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
