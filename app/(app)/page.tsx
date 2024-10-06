import { getUser } from '@/actions/auth/user'
import { getBackgrounds, getMusic, getTemplates } from '@/actions/db/page-data'
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries'
import { getVoices } from '@/actions/elevenlabs'
import { TemplateSchema } from '@/stores/templatestore'

import { TemplateSelect } from '@/components/form/template-select'
import { AIVideoForm } from '@/components/forms/ai-video-form'
import { ClipsForm } from '@/components/forms/clips-form'
import { RedditForm } from '@/components/forms/reddit-form'
import { SplitScreenForm } from '@/components/forms/split-screen-form'
import { TextMessageForm } from '@/components/forms/text-message-form'

export default async function Page({
  searchParams
}: {
  searchParams: { template: string }
}) {
  const selectedTemplate = searchParams.template || TemplateSchema.Enum.Reddit

  const [{ user }, voices, templates, backgrounds, music] = await Promise.all([
    getUser(),
    getVoices(),
    getTemplates(),
    getBackgrounds(),
    getMusic()
  ])

  const { youtubeChannels, tiktokAccounts } = user
    ? await fetchUserConnectSocialMediaAccounts(user.id)
    : { youtubeChannels: [], tiktokAccounts: [] }

  const commonProps = {
    voices,
    backgrounds,
    youtubeChannels,
    tiktokAccounts,
    music
  }

  const FormSelector = ({ selectedTemplate }: { selectedTemplate: string }) => {
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
      // case TemplateSchema.Enum.TwitterThread:
      //   return <TwitterForm {...commonProps} />;
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
      <TemplateSelect templates={templates} />
      <FormSelector selectedTemplate={selectedTemplate} />
    </div>
  )
}
