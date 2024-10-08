'use client'

import React, { useEffect, useState } from 'react'
import { getRedditInfo } from '@/actions/reddit'
import { VideoProps } from '@/stores/templatestore'
import { Loader2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type RedditUrlStepProps = {
  form: UseFormReturn<VideoProps>
}

export const RedditUrlStep: React.FC<RedditUrlStepProps> = ({ form }) => {
  const [postUrl, setPostUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const { execute, isPending } = useServerAction(getRedditInfo)

  const redditUrlSchema = z
    .string()
    .url()
    .refine(
      (url) => url.includes('reddit.com/r/') && url.includes('/comments/'),
      {
        message: 'Invalid Reddit post URL'
      }
    )

  const handleFetchRedditPost = async () => {
    try {
      redditUrlSchema.parse(postUrl)
      setUrlError(null)

      const [data, error] = await execute(postUrl)
      if (error) {
        toast.error(error.message)
      } else if (data) {
        form.setValue('title', data.title)
        form.setValue('subreddit', data.subreddit)
        form.setValue('accountName', data.accountName)
        form.setValue('text', data.text)
        form.setValue('likes', data.likes)
        form.setValue('comments', data.comments)
        toast.success('Reddit post data fetched successfully')
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
        <CardTitle>Reddit Post URL</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redditPostUrl">Enter Reddit Post URL</Label>
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
              'Fetch Post Data'
            )}
          </Button>
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
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground">
        You must generate a voiceover for the video to be updated
      </CardFooter>
    </Card>
  )
}
