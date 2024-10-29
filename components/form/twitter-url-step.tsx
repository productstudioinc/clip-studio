'use client'

import React, { useState } from 'react'
import { generatePresignedUrl } from '@/actions/generate-presigned-urls'
import { fetchTweet } from '@/actions/twitter'
import { VideoProps } from '@/stores/templatestore'
import {
  GripVertical,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
  User
} from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

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

export const TwitterUrlStep = ({ form }: TwitterUrlStepProps) => {
  const [tweetUrl, setTweetUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const { fields, append, remove, move, update } = useFieldArray({
    control: form.control,
    name: 'tweets'
  })

  const [uploadingStates, setUploadingStates] = useState<{
    [key: string]: boolean
  }>({})

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
        image: tweetData.photos?.[0]?.url || ''
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

  const handleImageUpload = (index: number, type: 'avatar' | 'image') => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10mb
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 10mb')
        return
      }

      const uploadKey = `${type}-${index}`
      setUploadingStates((prev) => ({ ...prev, [uploadKey]: true }))

      try {
        const contentType = file.type || 'application/octet-stream'
        const arrayBuffer = await file.arrayBuffer()
        const contentLength = arrayBuffer.byteLength

        const [data, err] = await generatePresignedUrl({
          contentType,
          contentLength
        })

        if (err) {
          throw new Error(err.message)
        }

        await fetch(data.presignedUrl, {
          method: 'PUT',
          body: arrayBuffer,
          headers: {
            'Content-Type': contentType
          }
        })

        update(index, { ...fields[index], [type]: data.readUrl })
        toast.success('Image uploaded successfully')
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'An error occurred during upload'
        )
      } finally {
        setUploadingStates((prev) => ({ ...prev, [uploadKey]: false }))
      }
    }
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
            <ScrollArea className="h-[500px] border rounded-md">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tweets">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4 p-4"
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
                              className="p-4"
                            >
                              <div className="flex space-x-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move self-center"
                                >
                                  <GripVertical className="text-gray-400" />
                                </div>
                                <div className="flex-grow space-y-4">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="w-12 h-12 flex-shrink-0">
                                      <AvatarImage
                                        src={field.avatar}
                                        alt={field.username}
                                      />
                                      <AvatarFallback>
                                        <User />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                      <Input
                                        {...form.register(
                                          `tweets.${index}.username`
                                        )}
                                        placeholder="Username"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 flex-shrink-0"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">
                                        Delete tweet
                                      </span>
                                    </Button>
                                  </div>
                                  <div className="flex space-x-4">
                                    <Textarea
                                      {...form.register(
                                        `tweets.${index}.content`
                                      )}
                                      placeholder="Tweet content"
                                      className="h-24 resize-none flex-grow"
                                    />
                                    {field.image && (
                                      <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                          src={field.image}
                                          alt="Tweet image"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleImageUpload(index, 'avatar')(e)
                                        }
                                        className="hidden"
                                        id={`avatar-upload-${index}`}
                                      />
                                      <Label
                                        htmlFor={`avatar-upload-${index}`}
                                        className={`cursor-pointer inline-flex items-center justify-center h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full ${
                                          uploadingStates[`avatar-${index}`]
                                            ? 'opacity-50 pointer-events-none'
                                            : ''
                                        }`}
                                      >
                                        {uploadingStates[`avatar-${index}`] && (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        <Upload
                                          className={`mr-2 h-4 w-4 flex-shrink-0 ${uploadingStates[`avatar-${index}`] ? 'hidden' : ''}`}
                                        />
                                        <span className="whitespace-nowrap">
                                          Change Avatar
                                        </span>
                                      </Label>
                                    </div>
                                    <div>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleImageUpload(index, 'image')(e)
                                        }
                                        className="hidden"
                                        id={`image-upload-${index}`}
                                      />
                                      <Label
                                        htmlFor={`image-upload-${index}`}
                                        className={`cursor-pointer inline-flex items-center justify-center h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full ${
                                          uploadingStates[`image-${index}`]
                                            ? 'opacity-50 pointer-events-none'
                                            : ''
                                        }`}
                                      >
                                        {uploadingStates[`image-${index}`] && (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        <Upload
                                          className={`mr-2 h-4 w-4 flex-shrink-0 ${uploadingStates[`image-${index}`] ? 'hidden' : ''}`}
                                        />
                                        <span className="whitespace-nowrap">
                                          {field.image
                                            ? 'Change Tweet Image'
                                            : 'Upload Tweet Image'}
                                        </span>
                                      </Label>
                                    </div>
                                  </div>
                                </div>
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
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
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
