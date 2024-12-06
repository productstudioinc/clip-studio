'use client'

import React, { useEffect, useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { ExportComponent, RenderProgress } from '@/components/form/form-submit'

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
  const { renderMedia, isLoading, renderId, isComplete } = useRendering()

  const [promptIndex, setPromptIndex] = useState(0)
  const [prompt, setPrompt] = useState(redditStoryPrompts[0])
  const { execute: generate, isPending: isGeneratingRedditPost } =
    useServerAction(generateRedditPost)
  const { execute: updateOnboarding, isPending: isUpdatingOnboarding } =
    useServerAction(updateOnboardingStatus)
  const { generateVoiceover, isGeneratingVoiceover } =
    useRedditVoiceoverGeneration(form)
  const { hasGeneratedVideo } = useOnboardingState()

  const cyclePrompt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const nextIndex = (promptIndex + 1) % redditStoryPrompts.length
    setPromptIndex(nextIndex)
    setPrompt(redditStoryPrompts[nextIndex])
  }

  const generatePost = async () => {
    try {
      const id = toast.loading('Generating Reddit post...')
      const [data, error] = await generate(prompt)
      if (error) {
        toast.error(error.message, { id })
      } else if (data) {
        form.setValue('title', data.title)
        form.setValue('subreddit', data.subreddit)
        form.setValue('accountName', data.accountName)
        form.setValue('text', data.text)
        form.setValue('likes', data.likes)
        form.setValue('comments', data.comments)
        toast.success('Reddit post generated successfully', { id })
      }
    } catch (error) {
      console.error('Error generating Reddit post:', error)
      toast.error('Error generating Reddit post')
    }
  }

  const [isGenerating, setIsGenerating] = useState(false)

  // Update onboarding status when video is generated
  useEffect(() => {
    if (isGenerating && isComplete) {
      const completeGeneration = async () => {
        const [, error] = await updateOnboarding({
          hasGeneratedVideo: true,
          videoGeneratedAt: new Date()
        })
        if (error) {
          toast.error('Failed to update onboarding status')
          console.error('Failed to update onboarding status', error)
        } else {
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { x: 0.5, y: 0.5 }
          })
          setIsGenerating(false)
        }
      }
      completeGeneration()
    }
  }, [isComplete, isGenerating, updateOnboarding])

  const generateVideo = async () => {
    try {
      setIsGenerating(true)
      await generatePost()
      await generateVoiceover()
      await renderMedia()
    } catch (error) {
      setIsGenerating(false)
      console.error('Error in video generation process:', error)
    }
  }

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
            />
            <Button
              onClick={cyclePrompt}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Random Story
            </Button>
          </div>
          <Button
            onClick={generateVideo}
            size="lg"
            className="w-full text-lg h-14"
            variant="rainbow"
            disabled={
              isGeneratingRedditPost ||
              isGeneratingVoiceover ||
              isLoading ||
              isUpdatingOnboarding
            }
          >
            {isGeneratingRedditPost ||
            isGeneratingVoiceover ||
            isLoading ||
            isUpdatingOnboarding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGeneratingRedditPost
                  ? 'Generating Post...'
                  : isGeneratingVoiceover
                    ? 'Generating Voiceover...'
                    : isLoading
                      ? 'Generating Video...'
                      : 'Updating Progress...'}
              </>
            ) : (
              <>Generate Video</>
            )}
          </Button>
          <small className="text-muted-foreground">
            This may take up to 30 seconds. Please be patient.
          </small>
          <RenderProgress id={renderId} />
          <Separator />
          <ExportComponent id={renderId} />
        </div>

        {/* <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="reddit-details" className="border-none">
            <AccordionTrigger className="text-center">
              Reddit Post Details
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                <Label htmlFor="redditSubreddit">Subreddit</Label>
                <Input
                  id="redditSubreddit"
                  type="text"
                  {...form.register('subreddit')}
                />
                <Label htmlFor="redditAccountName">Account Name</Label>
                <Input
                  id="redditAccountName"
                  type="text"
                  {...form.register('accountName')}
                />
                <Label htmlFor="redditTitle">Title</Label>
                <Input id="redditTitle" {...form.register('title')} />
                <Label htmlFor="redditText">Text</Label>
                <Textarea
                  id="redditText"
                  className="min-h-[140px]"
                  {...form.register('text')}
                />
                <Label htmlFor="redditLikes">Likes</Label>
                <Input
                  id="redditLikes"
                  type="number"
                  {...form.register('likes', { valueAsNumber: true })}
                />
                <Label htmlFor="redditComments">Comments</Label>
                <Input
                  id="redditComments"
                  type="number"
                  {...form.register('comments', { valueAsNumber: true })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion> */}
      </CardContent>
    </Card>
  )
}
