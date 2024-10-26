'use client'

import React, { useState } from 'react'
import { fetchTweet } from '@/actions/twitter'
import { VideoProps } from '@/stores/templatestore'
import { GripVertical, Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

type TwitterUrlStepProps = {
  form: UseFormReturn<VideoProps>
}

const twitterUrlSchema = z
  .string()
  .url()
  .refine(
    (url) =>
      (url.includes('twitter.com') && url.includes('/status/')) ||
      (url.includes('x.com') && url.includes('/status/')),
    {
      message: 'Invalid Twitter tweet URL'
    }
  )

export const TwitterUrlStep: React.FC<TwitterUrlStepProps> = ({ form }) => {
  const [tweetUrl, setTweetUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'tweets'
  })

  const handleFetchTweet = async () => {
    try {
      setIsPending(true)
      twitterUrlSchema.parse(tweetUrl)
      setUrlError(null)

      const tweetId = tweetUrl.match(/\/status\/(\d+)/)?.[1]
      if (!tweetId) {
        throw new Error('Could not extract tweet ID from URL')
      }

      const tweetData = await fetchTweet(tweetId)
      if (!tweetData) {
        throw new Error('Failed to fetch tweet data')
      }

      append({
        id: tweetId,
        username: tweetData.user.screen_name,
        avatar: tweetData.user.profile_image_url_https,
        content: tweetData.text,
        image: tweetData.entities.media?.[0]?.url || ''
      })

      toast.success('Tweet fetched successfully')
      setTweetUrl('')
    } catch (error) {
      if (error instanceof z.ZodError) {
        setUrlError(error.errors[0].message)
      } else {
        console.error('Error fetching tweet:', error)
        toast.error('Error fetching tweet')
      }
    } finally {
      setIsPending(false)
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    move(result.source.index, result.destination.index)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Twitter Tweets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitterTweetUrl">Fetch Tweet by URL</Label>
            <div className="flex space-x-2">
              <Input
                id="twitterTweetUrl"
                type="text"
                value={tweetUrl}
                onChange={(e) => {
                  setTweetUrl(e.target.value)
                  setUrlError(null)
                }}
                placeholder="https://twitter.com/username/status/..."
                disabled={isPending}
              />
              <Button
                onClick={handleFetchTweet}
                disabled={isPending || !tweetUrl}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Tweet'
                )}
              </Button>
            </div>
            {urlError && <p className="text-sm text-red-500">{urlError}</p>}
          </div>

          <div>
            <Label>Tweets</Label>
            <ScrollArea className="h-[400px] px-2 border rounded-md">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tweets">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 py-2"
                    >
                      {fields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-2"
                            >
                              <div className="flex items-center space-x-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="text-gray-400" />
                                </div>
                                <Input
                                  {...form.register(`tweets.${index}.username`)}
                                  placeholder="Username"
                                />
                                <Input
                                  {...form.register(`tweets.${index}.content`)}
                                  placeholder="Tweet content"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-10 h-10 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </ScrollArea>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() =>
                  append({
                    id: Date.now().toString(),
                    username: '',
                    avatar: '',
                    content: '',
                    image: ''
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Custom Tweet
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Tweets
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to clear all tweets?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove()}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
