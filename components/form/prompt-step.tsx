'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { generateStoryScript } from '@/actions/aiActions'
import { useAppContext } from '@/contexts/app-context'
import { AIImagesProps, AIVideoProps, VideoProps } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { Loader2, Wand2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

type PromptStepProps = {
  form: UseFormReturn<VideoProps>
  type: 'AIImages' | 'AIVideo'
}

const storyLengthOptions: {
  value: AIImagesProps['storyLength'] | AIVideoProps['storyLength']
  label: string
  range: AIImagesProps['range'] | AIVideoProps['range']
  segments: AIImagesProps['segments'] | AIVideoProps['segments']
}[] = [
  { value: 'short', label: 'Short', range: '1-2', segments: '6-7' },
  { value: 'medium', label: 'Medium', range: '3-4', segments: '12-14' },
  { value: 'long', label: 'Long', range: '5-7', segments: '18-21' }
]

export const PromptStep: React.FC<PromptStepProps> = ({ form, type }) => {
  const { user } = useAppContext()
  const router = useRouter()
  const { isPending, execute } = useServerAction(generateStoryScript)

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!user) {
      return router.push('/login')
    }

    const prompt = form.getValues('prompt')
    const range = form.getValues('range')
    const segments = form.getValues('segments')
    const [data, error] = await execute({ type, prompt, range, segments })
    if (error) {
      toast.error(`Error generating script: ${error.message}`)
    } else {
      if (type === 'AIImages') {
        const imageData = data.map((item) => ({
          text: item.text,
          imageDescription: item.imageDescription,
          imageUrl: null as string | null,
          duration: 5
        })) as AIImagesProps['videoStructure']
        form.setValue('videoStructure', imageData)
      } else {
        const videoData = data.map((item) => ({
          text: item.text,
          videoDescription: item.imageDescription,
          videoUrl: null as string | null,
          thumbnailUrl: null as string | null,
          duration: 5
        })) as AIVideoProps['videoStructure']
        form.setValue('videoStructure', videoData)
      }
    }
  }

  const handleStoryLengthChange = (value: AIImagesProps['storyLength'] | AIVideoProps['storyLength']) => {
    const option = storyLengthOptions.find((opt) => opt.value === value)
    if (option) {
      form.setValue('range', option.range)
      form.setValue('segments', option.segments)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write Your Prompt</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={`Enter your ${type === 'AIImages' ? 'image' : 'video'} prompt here...`}
                  {...field}
                  rows={3}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storyLength"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-4">
              <FormLabel>Story Length</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: AIImagesProps['storyLength'] | AIVideoProps['storyLength']) => {
                    field.onChange(value)
                    handleStoryLengthChange(value)
                  }}
                  defaultValue={field.value}
                  className="flex space-x-2"
                >
                  {storyLengthOptions.map((option) => (
                    <FormItem
                      className="flex items-center space-x-3 space-y-0"
                      key={option.value}
                    >
                      <FormControl>
                        <RadioGroupItem value={option.value} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          disabled={isPending}
          className="w-full mt-4"
          onClick={handleGenerate}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate Script{' '}
          <span className="text-muted-foreground ml-1">
            ~ {CREDIT_CONVERSIONS.SCRIPT_GENERATION} credit
          </span>
        </Button>
      </CardContent>
    </Card>
  )
}
