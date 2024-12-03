'use client'

import React, { CSSProperties } from 'react'
import {
  CaptionStyle,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { UseFormReturn } from 'react-hook-form'

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

type CaptionStyleStepProps = {
  form: UseFormReturn<VideoProps>
}

export type CaptionStyleType = {
  id: CaptionStyle
  name: string
  className: string
  style: React.CSSProperties
}

const captionStyles: CaptionStyleType[] = [
  {
    id: CaptionStyle.Default,
    name: 'Default',
    className: 'font-montserrat text-white',
    style: {
      color: 'white',
      textShadow:
        '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      fontSize: '28px',
      fontFamily: 'Montserrat, sans-serif',
      textTransform: 'uppercase',
      textAlign: 'center',
      lineHeight: '1.2'
    } as CSSProperties
  },
  {
    id: CaptionStyle.Comic,
    name: 'Comic',
    className: 'font-montserrat text-yellow',
    style: {
      color: 'yellow',
      fontSize: '28px',
      fontFamily: 'Montserrat, sans-serif',
      textTransform: 'uppercase',
      textAlign: 'center',
      lineHeight: '1.2'
    } as CSSProperties
  },
  {
    id: CaptionStyle.Animated,
    name: 'Animated',
    className: 'font-arial text-white',
    style: {
      fontFamily: 'Arial'
      // Add any additional styles specific to the animated style here
    } as CSSProperties
  }
]

export const CaptionStyleStep: React.FC<CaptionStyleStepProps> = ({ form }) => {
  const setCaptionStyle = useTemplateStore((state) => state.setCaptionStyle)

  const handleCaptionStyleChange = (value: CaptionStyle) => {
    form.setValue('captionStyle', value)
    setCaptionStyle(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Caption Style</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <FormField
            control={form.control}
            name="captionStyle"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={handleCaptionStyleChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    {captionStyles.map((style) => (
                      <Label
                        key={style.id}
                        className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value={style.id} className="sr-only" />
                        <div
                          className={`w-[250px] h-[200px] flex items-center justify-center rounded-t-md ${style.className}`}
                        >
                          <span style={style.style}>
                            Caption Style
                            <br />
                            Example
                          </span>
                        </div>
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
      </CardContent>
    </Card>
  )
}
