import { logger, task } from '@trigger.dev/sdk/v3'
import Replicate from 'replicate'

export const generateAiVideoTask = task({
  id: 'generate-ai-video',
  maxDuration: 300,
  run: async (payload: { prompt: string }) => {
    logger.log('Starting AI video generation', { prompt: payload.prompt })

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })

    const output = await replicate.run('minimax/video-01', {
      input: {
        prompt: payload.prompt
      }
    })

    logger.log('Video generation completed', { output })

    return {
      videoUrl: output
    }
  }
})
