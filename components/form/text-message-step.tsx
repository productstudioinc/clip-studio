'use client'

import React, { useEffect } from 'react'
import { TextMessageVideoProps, VideoProps } from '@/stores/templatestore'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from '@hello-pangea/dnd'
import {
  GripVertical,
  MessageSquareIcon,
  PlusCircle,
  Trash2
} from 'lucide-react'
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form'

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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

import { TextMessage } from '../text-message'

type TextMessageStepProps = {
  form: UseFormReturn<VideoProps>
}

// TODO: Implement AI-based fake text generation
const fakeTexts = [
  {
    sender: 'sender',
    content: { type: 'text', value: 'Hey, how are you?' },
    duration: 1,
    from: 0
  },
  {
    sender: 'receiver',
    content: { type: 'text', value: "I'm good, thanks! How about you?" },
    duration: 2.461,
    from: 1
  },
  {
    sender: 'sender',
    content: { type: 'text', value: 'Doing great! Want to grab coffee later?' },
    duration: 2.461,
    from: 3.461
  }
] as TextMessageVideoProps['messages']

export const TextMessageStep: React.FC<TextMessageStepProps> = ({ form }) => {
  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: 'messages'
  })

  const style = useWatch({
    control: form.control,
    name: 'style'
  })

  const mode = useWatch({
    control: form.control,
    name: 'mode'
  })

  const messages = useWatch({
    control: form.control,
    name: 'messages'
  })

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    move(result.source.index, result.destination.index)
  }

  const generateFakeTexts = async () => {
    remove()
    fakeTexts.forEach((text) => append(text))
  }

  const getNextSender = () => {
    const lastMessage = messages[messages.length - 1]
    return lastMessage?.sender === 'sender' ? 'receiver' : 'sender'
  }

  const getNextFrom = () => {
    const lastMessage = messages[messages.length - 1]
    return lastMessage?.from + lastMessage?.duration
  }

  useEffect(() => {
    form.setValue('isVoiceoverGenerated', false)
  }, [messages, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Sender Name</Label>
              <Input id="senderName" {...form.register('sender.name')} />
            </div>
            <div>
              <Label htmlFor="receiverName">Receiver Name</Label>
              <Input id="receiverName" {...form.register('receiver.name')} />
            </div>
            <div>
              <Label htmlFor="style">Style</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue('style', value as 'imessage' | 'whatsapp')
                }
                value={style}
              >
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imessage">iMessage</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div>
            <Label>Preview</Label>
            <TextMessage
              {...(useWatch({
                control: form.control
              }) as TextMessageVideoProps)}
            />
            <Label>Messages</Label>
            <ScrollArea className="h-[400px] px-2 border rounded-md">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="messages">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 py-2"
                    >
                      {fields.map((field, index) => {
                        const messageSender = useWatch({
                          control: form.control,
                          name: `messages.${index}.sender`
                        })

                        const messageContentType = useWatch({
                          control: form.control,
                          name: `messages.${index}.content.type`
                        })

                        return (
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
                                className="p-0 border-none"
                              >
                                <div className="flex items-center space-x-2">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="text-gray-400" />
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      type="button"
                                      variant={
                                        messageSender === 'receiver'
                                          ? 'default'
                                          : 'outline'
                                      }
                                      onClick={() =>
                                        form.setValue(
                                          `messages.${index}.sender`,
                                          'receiver'
                                        )
                                      }
                                    >
                                      <MessageSquareIcon className="md:mr-2 h-4 w-4" />
                                      <span className="hidden md:block">
                                        Left
                                      </span>
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={
                                        messageSender === 'sender'
                                          ? 'default'
                                          : 'outline'
                                      }
                                      onClick={() =>
                                        form.setValue(
                                          `messages.${index}.sender`,
                                          'sender'
                                        )
                                      }
                                    >
                                      <MessageSquareIcon className="md:mr-2 h-4 w-4 [transform:rotateY(180deg)]" />
                                      <span className="hidden md:block">
                                        Right
                                      </span>
                                    </Button>
                                  </div>
                                  <Select
                                    onValueChange={(value) =>
                                      form.setValue(
                                        `messages.${index}.content.type`,
                                        value as 'text' | 'image'
                                      )
                                    }
                                    value={messageContentType}
                                  >
                                    <SelectTrigger className="w-fit">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="image">
                                        Image
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {messageContentType === 'text' ? (
                                    <Input
                                      {...form.register(
                                        `messages.${index}.content.value`
                                      )}
                                      placeholder="Message content"
                                    />
                                  ) : (
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          const reader = new FileReader()
                                          reader.onloadend = () => {
                                            form.setValue(
                                              `messages.${index}.content.value`,
                                              reader.result as string
                                            )
                                          }
                                          reader.readAsDataURL(file)
                                        }
                                      }}
                                    />
                                  )}
                                  <div className="flex space-x-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="w-10 h-10 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="w-10 h-10 p-0"
                                      onClick={() =>
                                        insert(index + 1, {
                                          sender: getNextSender(),
                                          content: { type: 'text', value: '' },
                                          duration: 1,
                                          from: 0
                                        })
                                      }
                                    >
                                      <PlusCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full sm:w-auto"
                onClick={() =>
                  append({
                    sender: getNextSender(),
                    content: { type: 'text', value: '' },
                    duration: 1,
                    from: getNextFrom()
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Message
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full sm:w-auto"
                onClick={generateFakeTexts}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate Fake Texts
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Messages
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to reset the messages?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        remove()
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground">
        A voiceover needs to be generated for the video to be updated with these
        text messages.
      </CardFooter>
    </Card>
  )
}
