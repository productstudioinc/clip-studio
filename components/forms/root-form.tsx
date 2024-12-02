'use client'

import { TemplateSchema, useTemplateStore } from '@/stores/templatestore'

import { TemplateSelect } from '@/components/form/template-select'
import { AIVideoForm } from '@/components/forms/ai-video-form'
import { ClipsForm } from '@/components/forms/clips-form'
import { HopeCoreForm } from '@/components/forms/hopecore-form'
import { RedditForm } from '@/components/forms/reddit-form'
import { SplitScreenForm } from '@/components/forms/split-screen-form'
import { TextMessageForm } from '@/components/forms/text-message-form'
import { TwitterForm } from '@/components/forms/twitter-form'

export const RootForm: React.FC = () => {
  const { selectedTemplate } = useTemplateStore()

  const form = () => {
    switch (selectedTemplate) {
      case TemplateSchema.Enum.Reddit:
        return <RedditForm />
      case TemplateSchema.Enum.SplitScreen:
        return <SplitScreenForm />
      case TemplateSchema.Enum.TextMessage:
        return <TextMessageForm />
      case TemplateSchema.Enum.Clips:
        return <ClipsForm />
      case TemplateSchema.Enum.AIVideo:
        return <AIVideoForm />
      case TemplateSchema.Enum.Twitter:
        return <TwitterForm />
      case TemplateSchema.Enum.HopeCore:
        return <HopeCoreForm />
      default:
        return null
    }
  }

  return (
    <>
      <TemplateSelect />
      {form()}
    </>
  )
}
