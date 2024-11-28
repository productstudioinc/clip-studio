'use client'

import React, { useState } from 'react'
import { generatePresignedUrl } from '@/actions/generate-presigned-urls'
import { fetchTweet } from '@/actions/twitter'
import { defaultTwitterProps, VideoProps } from '@/stores/templatestore'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import {
  GripVertical,
  Loader2,
  PlusCircle,
  RefreshCw,
  Trash2,
  Upload,
  User
} from 'lucide-react'
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
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

  const tweets = useWatch({ control: form.control, name: 'tweets' })

  const [uploadingStates, setUploadingStates] = useState<{
    [key: string]: boolean
  }>({})

  const mode = useWatch({
    control: form.control,
    name: 'mode'
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
        name: tweetData.user.name,
        avatar: tweetData.user.profile_image_url_https,
        content: tweetData.text,
        image: tweetData.photos?.[0]?.url || '',
        verified: tweetData.user.verified,
        hideUsername: false,
        likes: tweetData.favorite_count,
        comments: tweetData.conversation_count,
        from:
          fields.length > 0
            ? (fields[fields.length - 1]?.from ?? 0) +
              (fields[fields.length - 1]?.duration ?? 0)
            : 0,
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

        form.setValue(`tweets.${index}.${type}`, data.readUrl)
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

  const generateFakeTweets = () => {
    remove()
    defaultTwitterProps.tweets.forEach((tweet) => append(tweet))
    form.clearErrors()
    form.setValue('isVoiceoverGenerated', true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tweets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="mode">Light Mode</Label>
            <Switch
              id="mode"
              checked={mode === 'dark'}
              onCheckedChange={(checked) =>
                form.setValue('mode', checked ? 'dark' : 'light')
              }
            />
            <Label htmlFor="mode">Dark Mode</Label>
          </div>

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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Tweets</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
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

                    // Clear any stale voice settings
                    const currentTweets = [...fields, newTweet]
                    const currentUsernames = currentTweets.map(
                      (tweet) => tweet.username
                    )
                    const currentVoiceSettings = (
                      form.getValues('voiceSettings') || []
                    ).filter((setting) =>
                      currentUsernames.includes(setting.username)
                    )

                    // Add voice setting for new tweet
                    form.setValue('voiceSettings', [
                      ...currentVoiceSettings,
                      { username: newTweet.username, voiceId: '' }
                    ])
                    form.setValue('isVoiceoverGenerated', false)
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Tweet
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateFakeTweets}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sample
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all tweets?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          remove()
                          form.setValue('voiceSettings', [])
                          form.setValue('isVoiceoverGenerated', false)
                        }}
                      >
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
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="p-4"
                            >
                              <div className="flex gap-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-4 cursor-move"
                                >
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
                                    <div className="flex-grow grid gap-4">
                                      <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Display Name</Label>
                                          <Input
                                            {...form.register(
                                              `tweets.${index}.name`
                                            )}
                                            placeholder="Display Name"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Username</Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              {...form.register(
                                                `tweets.${index}.username`,
                                                {
                                                  required: true,
                                                  validate: (value) => {
                                                    return (
                                                      value.trim() !== '' ||
                                                      'Username cannot be empty'
                                                    )
                                                  },
                                                  onChange: (e) => {
                                                    const newUsername =
                                                      e.target.value
                                                    const oldUsername =
                                                      tweets[index].username

                                                    const currentVoiceSettings =
                                                      form.getValues(
                                                        'voiceSettings'
                                                      ) || []
                                                    const updatedVoiceSettings =
                                                      currentVoiceSettings.map(
                                                        (setting) =>
                                                          setting.username ===
                                                          oldUsername
                                                            ? {
                                                                ...setting,
                                                                username:
                                                                  newUsername
                                                              }
                                                            : setting
                                                      )

                                                    form.setValue(
                                                      'voiceSettings',
                                                      updatedVoiceSettings
                                                    )
                                                    form.setValue(
                                                      'isVoiceoverGenerated',
                                                      false
                                                    )
                                                  }
                                                }
                                              )}
                                              placeholder="Username"
                                            />
                                            <Button
                                              type="button"
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => {
                                                const currentVoiceSettings =
                                                  form.getValues(
                                                    'voiceSettings'
                                                  ) || []

                                                remove(index)

                                                const remainingTweets =
                                                  fields.filter(
                                                    (_, i) => i !== index
                                                  )
                                                const remainingUsernames =
                                                  remainingTweets.map(
                                                    (tweet) => tweet.username
                                                  )

                                                const updatedVoiceSettings =
                                                  currentVoiceSettings.filter(
                                                    (setting) =>
                                                      remainingUsernames.includes(
                                                        setting.username
                                                      )
                                                  )

                                                form.setValue(
                                                  'voiceSettings',
                                                  updatedVoiceSettings
                                                )
                                                form.setValue(
                                                  'isVoiceoverGenerated',
                                                  false
                                                )
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          id={`verified-${index}`}
                                          checked={
                                            tweets?.[index]?.verified || false
                                          }
                                          onCheckedChange={(checked) => {
                                            form.setValue(
                                              `tweets.${index}.verified`,
                                              !!checked,
                                              { shouldDirty: true }
                                            )
                                          }}
                                        />
                                        <Label
                                          htmlFor={`verified-${index}`}
                                          className="text-sm"
                                        >
                                          Verified Account
                                        </Label>
                                        <Checkbox
                                          id={`hideUsername-${index}`}
                                          checked={
                                            tweets?.[index]?.hideUsername ||
                                            false
                                          }
                                          onCheckedChange={(checked) => {
                                            form.setValue(
                                              `tweets.${index}.hideUsername`,
                                              !!checked,
                                              { shouldDirty: true }
                                            )
                                          }}
                                        />
                                        <Label
                                          htmlFor={`hideUsername-${index}`}
                                          className="text-sm"
                                        >
                                          Hide Username
                                        </Label>
                                        <Checkbox
                                          id={`hideText-${index}`}
                                          checked={
                                            tweets?.[index]?.hideText || false
                                          }
                                          onCheckedChange={(checked) => {
                                            form.setValue(
                                              `tweets.${index}.hideText`,
                                              !!checked,
                                              { shouldDirty: true }
                                            )
                                          }}
                                        />
                                        <Label
                                          htmlFor={`hideText-${index}`}
                                          className="text-sm"
                                        >
                                          Hide Text
                                        </Label>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Tweet Content</Label>
                                    <Textarea
                                      {...form.register(
                                        `tweets.${index}.content`
                                      )}
                                      placeholder="Tweet content"
                                      className="h-24 resize-none"
                                    />
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Likes</Label>
                                      <Input
                                        {...form.register(
                                          `tweets.${index}.likes`,
                                          {
                                            valueAsNumber: true,
                                            setValueAs: (value) =>
                                              value === ''
                                                ? 0
                                                : parseInt(value, 10)
                                          }
                                        )}
                                        placeholder="Number of likes"
                                        type="number"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Comments</Label>
                                      <Input
                                        {...form.register(
                                          `tweets.${index}.comments`,
                                          {
                                            valueAsNumber: true,
                                            setValueAs: (value) =>
                                              value === ''
                                                ? 0
                                                : parseInt(value, 10)
                                          }
                                        )}
                                        placeholder="Number of comments"
                                        type="number"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-4">
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
                                        className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-2 text-sm border rounded-md hover:bg-accent"
                                      >
                                        {uploadingStates[`avatar-${index}`] ? (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                          <Upload className="mr-2 h-4 w-4" />
                                        )}
                                        Change Avatar
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
                                        className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-2 text-sm border rounded-md hover:bg-accent"
                                      >
                                        {uploadingStates[`image-${index}`] ? (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                          <Upload className="mr-2 h-4 w-4" />
                                        )}
                                        {field.image
                                          ? 'Change Image'
                                          : 'Upload Image'}
                                      </Label>
                                    </div>
                                  </div>

                                  {field.image && (
                                    <div className="mt-2">
                                      <img
                                        src={field.image}
                                        alt="Tweet"
                                        className="rounded-md max-h-48 object-cover"
                                      />
                                    </div>
                                  )}
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
