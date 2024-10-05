'use client'

import React from 'react'
import { TextMessageVideoProps, VideoProps } from '@/stores/templatestore'
import { GripVertical, PlusCircle, Trash2 } from 'lucide-react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type TextMessageStepProps = {
  form: UseFormReturn<VideoProps>
}

// TODO: Implement AI-based fake text generation
const fakeTexts = [
  { sender: 'sender', content: { type: 'text', value: 'Hey, how are you?' } },
  {
    sender: 'receiver',
    content: { type: 'text', value: "I'm good, thanks! How about you?" }
  },
  {
    sender: 'sender',
    content: { type: 'text', value: 'Doing great! Want to grab coffee later?' }
  }
] as TextMessageVideoProps['messages']

export const TextMessageStep: React.FC<TextMessageStepProps> = ({ form }) => {
  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: 'messages'
  })

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    move(result.source.index, result.destination.index)
  }

  const generateFakeTexts = async () => {
    remove()
    fakeTexts.forEach((text) => append(text))
  }

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
                value={form.watch('style')}
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
              <Label htmlFor="mode">Dark Mode</Label>
              <Switch
                id="mode"
                checked={form.watch('mode') === 'dark'}
                onCheckedChange={(checked) =>
                  form.setValue('mode', checked ? 'dark' : 'light')
                }
              />
            </div>
          </div>

          <div>
            <Label>Messages</Label>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="messages">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
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
                              <Select
                                onValueChange={(value) =>
                                  form.setValue(
                                    `messages.${index}.sender`,
                                    value as 'sender' | 'receiver'
                                  )
                                }
                                value={form.watch(`messages.${index}.sender`)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sender">Sender</SelectItem>
                                  <SelectItem value="receiver">
                                    Receiver
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                onValueChange={(value) =>
                                  form.setValue(
                                    `messages.${index}.content.type`,
                                    value as 'text' | 'image'
                                  )
                                }
                                value={form.watch(
                                  `messages.${index}.content.type`
                                )}
                              >
                                <SelectTrigger className="w-fit">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="image">Image</SelectItem>
                                </SelectContent>
                              </Select>
                              {form.watch(`messages.${index}.content.type`) ===
                              'text' ? (
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
                                      sender: 'sender',
                                      content: { type: 'text', value: '' }
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
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                append({
                  sender: 'sender',
                  content: { type: 'text', value: '' }
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
              className="mt-2"
              onClick={generateFakeTexts}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Fake Texts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
