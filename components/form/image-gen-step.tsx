'use client'

import React from 'react'
import Image from 'next/image'
import { VideoProps, visualStyles } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { Loader2, RefreshCcw, Wand2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import ZoomableImage from '@/components/zoomable-image'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type ImageGenStepProps = {
  form: UseFormReturn<VideoProps>
}

export function ImageGenStep({ form }: ImageGenStepProps) {
  const [generatingImages, setGeneratingImages] = React.useState<number[]>([])
  const [isGeneratingAll, setIsGeneratingAll] = React.useState(false)

  const generateSingleImage = async (index: number) => {
    const description = form.getValues(
      `videoStructure.${index}.imageDescription`
    )
    if (description) {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visualStyle: form.getValues('visualStyle'),
          prompt: description
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate image')
      }

      const data = await response.json()
      return { index, url: data.signedUrl }
    }
    return null
  }

  const handleGenerateAllImages = async () => {
    setIsGeneratingAll(true)
    const videoStructure = form.getValues('videoStructure')
    const indicesToGenerate = videoStructure
      .map((item, index) =>
        item.imageDescription && !generatingImages.includes(index) ? index : -1
      )
      .filter((index) => index !== -1)

    setGeneratingImages((prev) => [...prev, ...indicesToGenerate])

    for (const index of indicesToGenerate) {
      try {
        const result = await generateSingleImage(index)
        if (result) {
          form.setValue(`videoStructure.${result.index}.imageUrl`, result.url)
        }
      } catch (error) {
        toast.error(
          `Failed to generate image ${index + 1}: ${(error as Error).message}`
        )
      } finally {
        setGeneratingImages((prev) => prev.filter((i) => i !== index))
      }

      await sleep(750)
    }

    setIsGeneratingAll(false)
  }

  const handleGenerateImage = async (index: number) => {
    setGeneratingImages((prev) => [...prev, index])
    try {
      const result = await generateSingleImage(index)
      if (result) {
        form.setValue(`videoStructure.${result.index}.imageUrl`, result.url)
      }
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setGeneratingImages((prev) => prev.filter((i) => i !== index))
    }
  }

  const canGenerateMore = form
    .watch('videoStructure')
    .some(
      (item, index) =>
        item.imageDescription && !generatingImages.includes(index)
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Visual Style</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <FormField
            control={form.control}
            name="visualStyle"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    {visualStyles.map((style) => (
                      <Label
                        key={style.id}
                        className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary hover:cursor-pointer"
                      >
                        <RadioGroupItem value={style.id} className="sr-only" />
                        <Image
                          src={style.image}
                          alt={style.name}
                          width={200}
                          height={200}
                          className="w-[200px] h-[200px] object-cover rounded-t-md"
                        />
                        <span className="w-full p-2 text-center">
                          {style.name}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Image Generation</h3>
            <Button
              onClick={handleGenerateAllImages}
              disabled={isGeneratingAll || !canGenerateMore}
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating All...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate All Images
                </>
              )}
              <span className="text-muted-foreground ml-1">
                ~{' '}
                {CREDIT_CONVERSIONS.IMAGE_GENERATION *
                  form.watch('videoStructure').length}{' '}
                credits
              </span>
            </Button>
          </div>
          <ScrollArea className="h-[400px] w-full border rounded-md">
            <div className="p-4 space-y-4">
              {form.watch('videoStructure').map((item, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    {generatingImages.includes(index) ? (
                      <Skeleton className="h-[150px] w-[150px] rounded-md" />
                    ) : (
                      <ZoomableImage
                        src={item.imageUrl || '/placeholder.svg'}
                        alt={`Preview ${index + 1}`}
                        className="rounded-md object-cover h-[150px] w-[150px]"
                      />
                    )}
                  </div>
                  <div className="flex-grow flex flex-col">
                    <FormField
                      control={form.control}
                      name={`videoStructure.${index}.imageDescription`}
                      render={({ field }) => (
                        <FormItem className="flex-grow h-full">
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={`Enter description for image ${index + 1}`}
                              className="flex-grow resize-none h-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      className="mt-2 w-full"
                      onClick={() => handleGenerateImage(index)}
                      disabled={
                        generatingImages.includes(index) ||
                        !item.imageDescription
                      }
                    >
                      {generatingImages.includes(index) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : item.imageUrl ? (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Regenerate Image
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Image
                        </>
                      )}
                      <span className="text-muted-foreground ml-1">
                        ~ {CREDIT_CONVERSIONS.IMAGE_GENERATION} credits
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
