import { generateRedditVoiceover } from '@/actions/elevenlabs'
import { VideoProps } from '@/stores/templatestore'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

export const useRedditVoiceoverGeneration = (
  form: UseFormReturn<VideoProps>
) => {
  const { isPending, execute } = useServerAction(generateRedditVoiceover)

  const generateVoiceover = async () => {
    const selectedVoice = form.getValues('voice')
    const language = form.getValues('language')
    const text = form.getValues('text')
    const title = form.getValues('title')

    if (!selectedVoice || !text || !title) {
      toast.error(
        'Please select a voice, enter a title, and provide text for the voiceover.'
      )
      return false
    }

    const tid = toast.loading('Generating voiceover...')

    const [data, err] = await execute({
      title,
      voiceId: selectedVoice,
      text,
      language
    })

    if (err) {
      toast.error(err.message, { id: tid })
      return false
    }

    form.setValue('durationInFrames', Math.floor(data.endTimestamp * 30))
    form.setValue('voiceoverUrl', data.signedUrl)
    form.setValue('voiceoverFrames', data.voiceoverObject)
    form.setValue('isVoiceoverGenerated', true)
    form.clearErrors('isVoiceoverGenerated')

    toast.success('Voiceover generated successfully!', { id: tid })
    return true
  }

  return {
    generateVoiceover,
    isGeneratingVoiceover: isPending
  }
}
