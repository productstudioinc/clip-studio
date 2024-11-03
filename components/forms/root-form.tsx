'use client'

import {
  TikTokAccount,
  YoutubeChannel
} from '@/actions/db/social-media-queries'
import { ElevenlabsVoice } from '@/actions/elevenlabs'
import {
  SelectBackgroundWithParts,
  SelectMusic,
  SelectTemplates
} from '@/db/schema'
import { TemplateSchema, useTemplateStore } from '@/stores/templatestore'

import { TemplateSelect } from '@/components/form/template-select'
import { AIVideoForm } from '@/components/forms/ai-video-form'
import { ClipsForm } from '@/components/forms/clips-form'
import { RedditForm } from '@/components/forms/reddit-form'
import { SplitScreenForm } from '@/components/forms/split-screen-form'
import { TextMessageForm } from '@/components/forms/text-message-form'
import { TwitterForm } from '@/components/forms/twitter-form'

export const RootForm: React.FC<{
  voices: ElevenlabsVoice[]
  backgrounds: SelectBackgroundWithParts[]
  youtubeChannels: YoutubeChannel[]
  tiktokAccounts: TikTokAccount[]
  music: SelectMusic[]
  templates: SelectTemplates[]
}> = ({
  voices,
  backgrounds,
  youtubeChannels,
  tiktokAccounts,
  music,
  templates
}) => {
  const { selectedTemplate } = useTemplateStore()

  const commonProps = {
    voices,
    backgrounds,
    youtubeChannels,
    tiktokAccounts,
    music
  }

  const form = () => {
    switch (selectedTemplate) {
      case TemplateSchema.Enum.Reddit:
        return <RedditForm {...commonProps} />
      case TemplateSchema.Enum.SplitScreen:
        return <SplitScreenForm {...commonProps} />
      case TemplateSchema.Enum.TextMessage:
        return <TextMessageForm {...commonProps} />
      case TemplateSchema.Enum.Clips:
        return <ClipsForm {...commonProps} />
      case TemplateSchema.Enum.AIVideo:
        return <AIVideoForm {...commonProps} />
      case TemplateSchema.Enum.Twitter:
        return <TwitterForm {...commonProps} />
      default:
        return null
    }
  }

  return (
    <>
      <TemplateSelect templates={templates} />
      {form()}
    </>
  )
}
