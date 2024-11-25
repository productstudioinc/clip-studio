'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/contexts/app-context'
import { VideoProps } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { useRendering } from '@/utils/helpers/use-rendering'
import { Loader2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { TikTokExportDialog } from '@/components/form/tiktok-export'
import { YoutubeExportDialog } from '@/components/form/youtube-export'

interface RenderState {
  status: 'init' | 'invoking' | 'rendering' | 'done' | 'error'
  error?: { message: string }
}

const Megabytes: React.FC<{
  sizeInBytes: number
  className?: string
}> = ({ sizeInBytes, className }) => {
  const megabytes = Intl.NumberFormat('en', {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow'
  }).format(sizeInBytes)
  return <span className={cn('opacity-60', className)}>({megabytes})</span>
}

export const ExportComponent: React.FC<{ id: string }> = ({ id }) => {
  const { state } = useRendering(id)
  const isDownloadReady = state.status === 'done'
  return (
    <div className="w-full">
      {isDownloadReady ? (
        <a href={state.url}>
          <Button className="w-full h-12 text-md" type="button">
            Download
            <Megabytes sizeInBytes={state.size} className="ml-1" />
          </Button>
        </a>
      ) : (
        <Button disabled className="w-full h-12 text-md">
          Download
        </Button>
      )}
    </div>
  )
}

export const RenderProgress: React.FC<{ id: string }> = ({ id }) => {
  const { state } = useRendering(id)
  if (state.status !== 'rendering') return null
  return (
    <div className="space-y-2 pt-4">
      <Progress value={state.progress * 100} />
      <p className="text-sm text-center text-muted-foreground">
        Rendering: {Math.round(state.progress * 100)}%
      </p>
    </div>
  )
}

type FormSubmitProps = {
  form: UseFormReturn<VideoProps>
}

export function FormSubmit({ form }: FormSubmitProps) {
  const { youtubeChannels, tiktokAccounts, user } = useAppContext()
  const router = useRouter()
  const { renderMedia, state, isLoading, isComplete, inputProps, renderId } =
    useRendering()

  const handleGenerateVideo = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()

    if (!user) {
      return router.push('/login')
    }

    const isVoiceoverGenerated = form.getValues('isVoiceoverGenerated')

    if (!isVoiceoverGenerated) {
      toast.error('You must generate a voiceover first.')
      form.setError('isVoiceoverGenerated', {
        type: 'manual',
        message: 'You must generate a voiceover first.'
      })
      return
    }

    await renderMedia()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Video</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(form.formState.errors).map(([key, error]) => (
          <div key={key} className="text-red-500 mb-4">
            Error: {error.message}
          </div>
        ))}
        <Button
          variant={'rainbow'}
          disabled={
            isLoading ||
            state.status === 'done' ||
            form.formState.isSubmitting ||
            !form.formState.isValid
          }
          onClick={handleGenerateVideo}
          size="lg"
          className="w-full text-lg h-14"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Video
          <span className="text-muted-foreground ml-2">
            {` ~ ${Math.ceil(inputProps.durationInFrames / 30 / CREDIT_CONVERSIONS.EXPORT_SECONDS)} credits`}
          </span>
        </Button>
        <div className="flex flex-col space-y-4">
          <RenderProgress id={renderId} />
          <Separator />
          <ExportComponent id={renderId} />
          {youtubeChannels && tiktokAccounts && (
            <>
              <Separator />
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-1/2">
                  <YoutubeExportDialog
                    youtubeChannels={youtubeChannels ?? []}
                    disabled={!isComplete}
                    state={state}
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <TikTokExportDialog
                    tiktokAccounts={tiktokAccounts ?? []}
                    disabled={!isComplete}
                    state={state}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
