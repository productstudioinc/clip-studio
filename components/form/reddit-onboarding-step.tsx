'use client'

import React, { useState } from 'react'
import { generateRedditPost } from '@/actions/aiActions'
import { updateOnboardingStatus } from '@/actions/db/onboarding-queries'
import { VideoProps } from '@/stores/templatestore'
import { useRendering } from '@/utils/helpers/use-rendering'
import confetti from 'canvas-confetti'
import { Info, Loader2, Shuffle } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { useOnboardingState } from '@/lib/hooks/use-onboarding-state'
import { useRedditVoiceoverGeneration } from '@/lib/hooks/use-reddit-voiceover-generation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RenderProgress } from '@/components/form/form-submit'

type RedditOnboardingStepProps = {
  form: UseFormReturn<VideoProps>
}

const redditStoryPrompts = [
  'A story about a man cheating on his wife',
  'An unexpected act of kindness from a stranger',
  'A hilarious misunderstanding at work',
  "A surprising discovery in someone's attic",
  'A heartwarming reunion between long-lost siblings',
  'An embarrassing moment at a wedding',
  'A thrilling encounter with wildlife',
  'A life-changing decision made on a whim',
  'A mysterious package delivered to the wrong address',
  'An unforgettable road trip adventure'
]

export const RedditOnboardingStep: React.FC<RedditOnboardingStepProps> = ({
  form
}) => {
  const {
    renderMedia,
    isLoading: isRendering,
    renderId,
    isComplete
  } = useRendering()
  const [promptIndex, setPromptIndex] = useState(0)
  const [prompt, setPrompt] = useState(redditStoryPrompts[0])
  const { execute: generate, isPending: isGeneratingRedditPost } =
    useServerAction(generateRedditPost)
  const { execute: updateOnboarding, isPending: isUpdatingOnboarding } =
    useServerAction(updateOnboardingStatus)
  const { generateVoiceover, isGeneratingVoiceover } =
    useRedditVoiceoverGeneration(form)
  const { hasGeneratedVideo, refresh } = useOnboardingState()

  const [isGenerating, setIsGenerating] = useState(false)

  const cyclePrompt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const nextIndex = (promptIndex + 1) % redditStoryPrompts.length
    setPromptIndex(nextIndex)
    setPrompt(redditStoryPrompts[nextIndex])
  }

  const generatePost = async () => {
    const id = toast.loading('Generating Reddit post...')
    try {
      const [data, error] = await generate(prompt)
      if (error) throw error
      if (!data) throw new Error('No data received')

      form.setValue('title', data.title)
      form.setValue('subreddit', data.subreddit)
      form.setValue('accountName', data.accountName)
      form.setValue('text', data.text)
      form.setValue('likes', data.likes)
      form.setValue('comments', data.comments)
      toast.success('Reddit post generated successfully', { id })
    } catch (error) {
      console.error('Error generating Reddit post:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error generating Reddit post',
        { id }
      )
      throw error // Re-throw to handle in the parent
    }
  }

  const generateVideo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (hasGeneratedVideo) {
      return toast.info(
        'You have already generated a video in this step. Please continue to the next step.'
      )
    }

    const toastId = toast.loading('Starting video generation...')
    setIsGenerating(true)

    try {
      // Step 1: Generate Reddit post
      await generatePost()
      toast.loading('Generating voiceover...', { id: toastId })

      // Step 2: Generate voiceover
      await generateVoiceover()
      toast.loading('Updating progress...', { id: toastId })

      // Step 3: Update onboarding status
      const [, error] = await updateOnboarding({
        hasGeneratedVideo: true,
        videoGeneratedAt: new Date()
      })
      if (error) throw error

      // Step 4: Refresh onboarding state
      await refresh()

      // Success!
      toast.success('Video generated successfully!', { id: toastId })
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.5 }
      })
    } catch (error) {
      console.error('Error in video generation process:', error)
      toast.error(
        error instanceof Error
          ? `Error: ${error.message}`
          : 'Error in video generation process',
        { id: toastId }
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const isProcessing =
    isGenerating ||
    isGeneratingRedditPost ||
    isGeneratingVoiceover ||
    isRendering ||
    isUpdatingOnboarding

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Reddit Story
          <HoverCard>
            <HoverCardTrigger>
              <Info className="h-5 w-5 cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80 text-base">
              This is just a simplified demo to generate a fake Reddit story
              using AI. If you want to use a real Reddit story, you can also
              input a url to a reddit post in the full version of the app.
            </HoverCardContent>
          </HoverCard>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label htmlFor="redditPrompt" className="text-lg font-medium">
            What kind of Reddit story would you like to create?
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="redditPrompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A story about a man cheating on his wife"
              className="text-lg w-full"
              disabled={isProcessing}
            />
            <Button
              onClick={cyclePrompt}
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isProcessing}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Random Story
            </Button>
          </div>
          <Button
            onClick={generateVideo}
            size="lg"
            type="button"
            className="w-full text-lg h-14"
            variant="rainbow"
            disabled={isProcessing || hasGeneratedVideo}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGeneratingRedditPost
                  ? 'Generating Post...'
                  : isGeneratingVoiceover
                    ? 'Generating Voiceover...'
                    : isRendering
                      ? 'Generating Video...'
                      : 'Processing...'}
              </>
            ) : (
              'Generate Video'
            )}
          </Button>
          <small className="text-muted-foreground">
            This may take up to 30 seconds. Please be patient.
          </small>
          <RenderProgress id={renderId} />
        </div>
      </CardContent>
    </Card>
  )
}
