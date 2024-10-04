import { getUser } from '@/actions/auth/user'
import { getTemplates } from '@/actions/db/page-data'
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries'
import { getVoices } from '@/actions/elevenlabs'

import { TemplateSelect } from '@/components/template-select'
import TextForm from '@/app/(app)/editor/text-form'

export default async function Page() {
  const { user } = await getUser()
  const voices = await getVoices()
  const [templates] = await Promise.all([getTemplates()])

  const { youtubeChannels, tiktokAccounts } = user
    ? await fetchUserConnectSocialMediaAccounts(user.id)
    : { youtubeChannels: [], tiktokAccounts: [] }

  return (
    <>
      <TemplateSelect templates={templates} />

      {/* <VideoCreatorForm /> */}

      <TextForm
        youtubeChannels={youtubeChannels}
        tiktokAccounts={tiktokAccounts}
        voices={voices}
      />
    </>
  )
}
