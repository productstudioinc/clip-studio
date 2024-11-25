'use client'

import React, { useEffect, useState } from 'react'
import { generateRedditPost } from '@/actions/aiActions'
import { getRedditInfo } from '@/actions/reddit'
import { VideoProps } from '@/stores/templatestore'
import { Loader2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

type RedditUrlStepProps = {
  form: UseFormReturn<VideoProps>
}

export const RedditUrlStep: React.FC<RedditUrlStepProps> = ({ form }) => {
  const [postUrl, setPostUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const { execute, isPending } = useServerAction(getRedditInfo)
  const { execute: generate, isPending: isGeneratingRedditPost } =
    useServerAction(generateRedditPost)

  const redditUrlSchema = z
    .string()
    .url()
    .refine(
      (url) => url.includes('reddit.com/r/') && url.includes('/comments/'),
      {
        message: 'Invalid Reddit post URL'
      }
    )

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

  const handleFetchRedditPost = async () => {
    try {
      redditUrlSchema.parse(postUrl)
      setUrlError(null)

      const id = toast.loading('Fetching Reddit post...')
      const [data, error] = await execute(postUrl)
      if (error) {
        toast.error(error.message, { id })
      } else if (data) {
        form.setValue('title', data.title)
        form.setValue('subreddit', data.subreddit)
        form.setValue('accountName', data.accountName)
        form.setValue('text', data.text)
        form.setValue('likes', data.likes)
        form.setValue('comments', data.comments)
        toast.success('Reddit post data fetched successfully', { id })
        setPostUrl('')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setUrlError(error.errors[0].message)
      } else {
        console.error('Error fetching Reddit post:', error)
        toast.error('Error fetching Reddit post')
      }
    }
  }

  useEffect(() => {
    const fieldsToWatch = [
      'title',
      'subreddit',
      'accountName',
      'text',
      'likes',
      'comments'
    ]

    const subscription = form.watch((value, { name }) => {
      if (fieldsToWatch.includes(name as string)) {
        form.setValue('isVoiceoverGenerated', false)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reddit Story</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Generated</TabsTrigger>
            <TabsTrigger value="custom">Custom Reddit URL</TabsTrigger>
          </TabsList>
          <TabsContent value="ai">
            <div className="space-y-4">
              <Label htmlFor="redditPrompt">
                Enter a prompt for the AI to generate a Reddit story
              </Label>
              <Input
                id="redditPrompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Make me a reddit story about husband cheating on wife"
              />
              <Button
                onClick={generatePost}
                className="w-full"
                variant="rainbow"
                disabled={isGeneratingRedditPost}
              >
                {isGeneratingRedditPost ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Story
                    <span className="text-muted-foreground ml-1 hidden sm:inline">
                      ~ 1 credit
                    </span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="custom">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redditPostUrl">Enter Reddit URL</Label>
                <Input
                  id="redditPostUrl"
                  type="text"
                  value={postUrl}
                  onChange={(e) => {
                    setPostUrl(e.target.value)
                    setUrlError(null)
                  }}
                  placeholder="https://www.reddit.com/r/subreddit/comments/..."
                  disabled={isPending}
                />
                {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              </div>
              <Button
                onClick={handleFetchRedditPost}
                className="w-full"
                disabled={isPending || !postUrl}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Get Reddit Post from URL'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <Accordion type="single" collapsible className="mt-4">
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
                  disabled={isPending}
                />
                <Label htmlFor="redditAccountName">Account Name</Label>
                <Input
                  id="redditAccountName"
                  type="text"
                  {...form.register('accountName')}
                  disabled={isPending}
                />
                <Label htmlFor="redditTitle">Title</Label>
                <Input
                  id="redditTitle"
                  {...form.register('title')}
                  disabled={isPending}
                />
                <Label htmlFor="redditText">Text</Label>
                <Textarea
                  id="redditText"
                  className="min-h-[140px]"
                  {...form.register('text')}
                  disabled={isPending}
                />
                <Label htmlFor="redditLikes">Likes</Label>
                <Input
                  id="redditLikes"
                  type="number"
                  {...form.register('likes', { valueAsNumber: true })}
                  disabled={isPending}
                />
                <Label htmlFor="redditComments">Comments</Label>
                <Input
                  id="redditComments"
                  type="number"
                  {...form.register('comments', { valueAsNumber: true })}
                  disabled={isPending}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
