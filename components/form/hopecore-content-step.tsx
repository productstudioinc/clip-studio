'use client'

import React, { useState } from 'react'
import { generateHopeCoreStory } from '@/actions/aiActions'
import { VideoProps } from '@/stores/templatestore'
import { Loader2 } from 'lucide-react'
import { UseFormReturn, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface HopeCoreContentStepProps {
  form: UseFormReturn<VideoProps>
}

export const HopeCoreContentStep: React.FC<HopeCoreContentStepProps> = ({
  form
}) => {
  const [prompt, setPrompt] = useState('')
  const { execute: generate, isPending: isGeneratingStory } = useServerAction(
    generateHopeCoreStory
  )

  const story = useWatch({
    control: form.control,
    name: 'text'
  })

  const generateStory = async () => {
    try {
      const id = toast.loading('Generating HopeCore story...')
      const [data, error] = await generate(prompt)
      if (error) {
        toast.error(error.message, { id })
      } else if (data) {
        form.setValue('text', data.story)
        form.setValue('isVoiceoverGenerated', false)
        toast.success('HopeCore story generated successfully', { id })
      }
    } catch (error) {
      console.error('Error generating HopeCore story:', error)
      toast.error('Error generating HopeCore story')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Your HopeCore Story</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label htmlFor="storyPrompt">
            Enter a prompt for the AI to generate a HopeCore story
          </Label>
          <Input
            id="storyPrompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. An inspiring story about overcoming adversity"
          />
          <Button
            onClick={generateStory}
            className="w-full"
            variant="rainbow"
            disabled={isGeneratingStory}
          >
            {isGeneratingStory ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate HopeCore Story
                <span className="text-muted-foreground ml-1 hidden sm:inline">
                  ~ 1 credit
                </span>
              </>
            )}
          </Button>
          <Textarea
            value={story}
            onChange={(e) => form.setValue('text', e.target.value)}
            placeholder="Share your inspiring story here..."
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
