'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  defaultRedditProps,
  RedditVideoProps,
  RedditVideoSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useOnboardingState } from '@/lib/hooks/use-onboarding-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { RedditOnboardingStep } from '@/components/form/reddit-onboarding-step'
import { VideoPreview } from '@/components/form/video-preview'

export const Demo: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { hasGeneratedVideo } = useOnboardingState()
  const form = useForm<VideoProps>({
    resolver: zodResolver(RedditVideoSchema),
    defaultValues: defaultRedditProps
  })

  const setRedditState = useTemplateStore((state) => state.setRedditState)

  // Add this effect to update the store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setRedditState(value as Partial<RedditVideoProps>)
    })
    return () => subscription.unsubscribe()
  }, [form, setRedditState])

  function onContinue() {
    const params = new URLSearchParams(searchParams)
    params.set('step', '3')
    router.push(`/onboarding?${params.toString()}`)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Let&apos;s make a video about a reddit story
        </h1>
        {hasGeneratedVideo && (
          <Alert className="mb-6">
            <CheckCircle2 className="h-5 w-5 stroke-green-600" />
            <AlertTitle>Video Generated Successfully!</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                Great job! You can now download your video or continue to the
                next step.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Form {...form}>
        <form className="space-y-8 w-full max-w-6xl mx-auto py-4">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-7 space-y-6 p-4">
              <RedditOnboardingStep form={form} />
              {/* <RedditVoiceStep form={form} /> */}
              {/* <MusicStep form={form} music={music} /> */}
              {/* <BackgroundSelectStep form={form} backgrounds={backgrounds} /> */}
              {/* <CaptionStyleStep form={form} /> */}
              {/* <AspectRatioStep form={form} /> */}
              {/* <FormSubmit form={form} /> */}
            </div>

            <div className="col-span-12 lg:col-span-5 p-4">
              <div className="sticky top-8 flex items-center justify-center">
                <VideoPreview form={form} />
              </div>
            </div>
          </div>
        </form>
      </Form>

      <div className="fixed md:static bottom-0 left-0 right-0 p-4 bg-background md:bg-transparent border-t md:border-t-0 border-border">
        <div className="flex justify-center">
          <Button onClick={onContinue} className="w-full max-w-4xl">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
