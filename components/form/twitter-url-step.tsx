'use client'

import React, { useState } from 'react'
import { generatePresignedUrl } from '@/actions/generate-presigned-urls'
import { fetchTweet } from '@/actions/twitter'
import { defaultTwitterProps, VideoProps } from '@/stores/templatestore'
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable
} from '@hello-pangea/dnd'
import {
  GripVertical,
  Loader2,
  PlusCircle,
  RefreshCw,
  Trash2,
  Upload,
  User
} from 'lucide-react'
import { FieldArrayWithId, useFieldArray, UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

type TwitterUrlStepProps = {
  form: UseFormReturn<VideoProps>
}

type TweetCardProps = {
  field: FieldArrayWithId<VideoProps, 'tweets', 'id'>
  index: number
  form: UseFormReturn<VideoProps>
  remove: (index: number) => void
  provided: DraggableProvided
}

type ImageUploadProps = {
  type: 'avatar' | 'image'
  index: number
  form: UseFormReturn<VideoProps>
}

const twitterUrlSchema = z
  .string()
  .url()
  .refine(
    (url) =>
      (url.includes('twitter.com') && url.includes('/status/')) ||
      (url.includes('x.com') && url.includes('/status/')),
    { message: 'Invalid Twitter tweet URL' }
  )

export const TwitterUrlStep = ({ form }: TwitterUrlStepProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'tweets'
  })
  const [tweetUrl, setTweetUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const generateFakeTweets = () => {
    remove()
    defaultTwitterProps.tweets.forEach((tweet) => append(tweet))
    form.clearErrors()
    form.setValue('isVoiceoverGenerated', true)
  }

  const clearAllTweets = () => {
    remove()
    form.setValue('voiceSettings', [])
    form.setValue('isVoiceoverGenerated', false)
  }

  const handleAddTweet = () => {
    const randomUsername = `user${Math.floor(Math.random() * 10000)}`
    const newTweet = {
      id: Date.now().toString(),
      username: randomUsername,
      name: '',
      avatar: '',
      content: '',
      image: '',
      verified: false,
      hideUsername: false,
      hideText: false,
      likes: 0,
      comments: 0,
      from: 0,
      duration: 3
    }
    append(newTweet)

    const currentTweets = form.getValues('tweets') || []
    const currentUsernames = currentTweets.map((tweet) => tweet.username)
    const currentVoiceSettings = (form.getValues('voiceSettings') || []).filter(
      (setting) => currentUsernames.includes(setting.username)
    )

    form.setValue('voiceSettings', [
      ...currentVoiceSettings,
      { username: newTweet.username, voiceId: '' }
    ])
    form.setValue('isVoiceoverGenerated', false)
  }

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
        name: tweetData.user.name,
        avatar: tweetData.user.profile_image_url_https,
        content: tweetData.text,
        image: tweetData.photos?.[0]?.url || '',
        verified: tweetData.user.verified,
        hideUsername: false,
        likes: tweetData.favorite_count,
        comments: tweetData.conversation_count,
        from: 0,
        duration: 3,
        hideText: false
      })
      form.setValue('isVoiceoverGenerated', false)

      const currentVoiceSettings = form.getValues('voiceSettings') || []
      const username = tweetData.user.screen_name

      if (!currentVoiceSettings.some((s) => s.username === username)) {
        form.setValue('voiceSettings', [
          ...currentVoiceSettings,
          { username, voiceId: '' }
        ])
      }

      toast.success('Tweet fetched successfully')
      setTweetUrl('')
    } catch (error) {
      if (error instanceof z.ZodError) {
        setUrlError(error.errors[0].message)
      } else {
        toast.error(
          error instanceof Error ? error.message : 'Error fetching tweet'
        )
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Twitter Tweets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow space-y-2">
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
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <Button type="button" onClick={handleAddTweet}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Tweet
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={generateFakeTweets}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all tweets?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllTweets}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <ScrollArea className="h-[500px] border rounded-md">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tweets">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 space-y-4"
                >
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided) => (
                        <TweetCard
                          key={field.id}
                          field={field}
                          index={index}
                          form={form}
                          remove={remove}
                          provided={provided}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

const TweetCard = ({
  field,
  index,
  form,
  remove,
  provided
}: TweetCardProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={`item-${index}`}>
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="p-4"
        >
          <div className="flex gap-4">
            <div {...provided.dragHandleProps} className="mt-4 cursor-move">
              <GripVertical className="text-muted-foreground" />
            </div>
            <div className="flex-grow space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={field.avatar} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <Input
                    {...form.register(`tweets.${index}.name`)}
                    placeholder="Display Name"
                    className="mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      {...form.register(`tweets.${index}.username`, {
                        required: true
                      })}
                      placeholder="Username"
                    />
                    <AccordionTrigger className="border p-2 rounded-md" />
                  </div>
                </div>
              </div>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tweet-content-${index}`}>
                      Tweet Content
                    </Label>
                    <Textarea
                      id={`tweet-content-${index}`}
                      {...form.register(`tweets.${index}.content`)}
                      placeholder="Tweet content"
                      className="h-24 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`likes-${index}`}>Likes</Label>
                      <Input
                        id={`likes-${index}`}
                        {...form.register(`tweets.${index}.likes`)}
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`comments-${index}`}>Comments</Label>
                      <Input
                        id={`comments-${index}`}
                        {...form.register(`tweets.${index}.comments`)}
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tweet Options</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`verified-${index}`}
                          checked={field.verified}
                          onCheckedChange={(checked) =>
                            form.setValue(
                              `tweets.${index}.verified`,
                              !!checked,
                              { shouldDirty: true }
                            )
                          }
                        />
                        <Label htmlFor={`verified-${index}`}>Verified</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`hideUsername-${index}`}
                          checked={field.hideUsername}
                          onCheckedChange={(checked) =>
                            form.setValue(
                              `tweets.${index}.hideUsername`,
                              !!checked,
                              { shouldDirty: true }
                            )
                          }
                        />
                        <Label htmlFor={`hideUsername-${index}`}>
                          Hide Username
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`hideText-${index}`}
                          checked={field.hideText}
                          onCheckedChange={(checked) =>
                            form.setValue(
                              `tweets.${index}.hideText`,
                              !!checked,
                              { shouldDirty: true }
                            )
                          }
                        />
                        <Label htmlFor={`hideText-${index}`}>Hide Text</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Images</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <ImageUpload type="avatar" index={index} form={form} />
                      <ImageUpload type="image" index={index} form={form} />
                    </div>
                  </div>

                  {field.image && (
                    <div className="space-y-2">
                      <Label>Tweet Image Preview</Label>
                      <img
                        src={field.image}
                        alt="Tweet"
                        className="rounded-md max-h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      Remove Tweet
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </div>
          </div>
        </Card>
      </AccordionItem>
    </Accordion>
  )
}

const ImageUpload = ({ type, index, form }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10mb
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10mb')
      return
    }

    setIsUploading(true)

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

      form.setValue(`tweets.${index}.${type}`, data.readUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred during upload'
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id={`${type}-upload-${index}`}
      />
      <Label
        htmlFor={`${type}-upload-${index}`}
        className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-2 text-sm border rounded-md hover:bg-accent"
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {type === 'avatar' ? 'Change Avatar' : 'Upload Image'}
      </Label>
    </div>
  )
}
