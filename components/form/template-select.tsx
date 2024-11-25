'use client'

import React from 'react'
import Link from 'next/link'
import { useAppContext } from '@/contexts/app-context'
import { TemplateProps, useTemplateStore } from '@/stores/templatestore'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

type TemplateSelectProps = {}

export const TemplateSelect: React.FC<TemplateSelectProps> = () => {
  const { templates } = useAppContext()
  const { selectedTemplate, setSelectedTemplate } = useTemplateStore(
    (state) => ({
      selectedTemplate: state.selectedTemplate,
      setSelectedTemplate: state.setSelectedTemplate
    })
  )

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value as TemplateProps)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Template</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <RadioGroup
            onValueChange={handleTemplateChange}
            value={selectedTemplate}
            className="flex space-x-4"
          >
            {templates.map((template) => (
              <Label
                key={template.id.toString()}
                className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary hover:cursor-pointer transition-all duration-300 ease-in-out"
              >
                <RadioGroupItem value={template.value} className="sr-only" />
                <video
                  src={template.previewUrl}
                  width={200}
                  height={300}
                  autoPlay
                  loop
                  playsInline
                  muted
                  className="w-[200px] h-[300px] object-cover rounded-t-md"
                />
                <span className="w-full p-2 text-center">{template.name}</span>
              </Label>
            ))}
            <Link href="/feedback?type=template_request">
              <Label className="relative flex-shrink-0 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted bg-popover hover:bg-accent hover:text-accent-foreground hover:cursor-pointer transition-all duration-300 ease-in-out w-[200px] h-full">
                <span className="text-center">Request a Template</span>
              </Label>
            </Link>
          </RadioGroup>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
