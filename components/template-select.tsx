/* eslint-disable @next/next/no-img-element */
'use client'

import type { FC } from 'react'
import { SelectTemplates } from '@/db/schema'
import { useTemplateStore } from '@/stores/templatestore'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TemplateSelectProps {
  templates: SelectTemplates[]
}

export const TemplateSelect: FC<TemplateSelectProps> = ({ templates }) => {
  const { selectedTemplate, setSelectedTemplate } = useTemplateStore(
    (state) => ({
      selectedTemplate: state.selectedTemplate,
      setSelectedTemplate: state.setSelectedTemplate
    })
  )

  const handleSelect = (value: string) => {
    setSelectedTemplate(
      value as
        | 'SplitScreen'
        | 'Reddit'
        | 'Twitter'
        | 'Clips'
        | 'TextMessage'
        | 'AIVideo'
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.value}
          onClick={() => handleSelect(template.value)}
          className="cursor-pointer"
        >
          <Card
            className={`h-full transition-all duration-300 ${
              selectedTemplate === template.value
                ? 'ring-2 ring-primary'
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center pb-4 px-4">
              <div className="relative w-full pt-[60%]">
                <video
                  src={template.previewUrl}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  autoPlay
                  loop
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
