import { openai } from '@ai-sdk/openai'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger, task } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import Replicate from 'replicate'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!
  }
})

export const generateAiVideoTask = task({
  id: 'generate-ai-video',
  maxDuration: 300,
  run: async (payload: { prompt: string }) => {
    logger.log('Starting AI video generation process', {
      prompt: payload.prompt
    })

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `You will be provided with a video concept. Create a detailed, vivid image prompt based on the following video concept. 
      The prompt should be suitable for AI image generation and focus on the key visual elements.

      Guidelines:
      - Focus on the main subject and their actions
      - Include details about lighting, atmosphere, and style
      - Specify camera angle or perspective if relevant
      - Keep the description clear and specific
      - Avoid abstract concepts that can't be visualized
      - Include artistic style references when appropriate
      - Limit to 50-75 words
      - Make it suitable for social media content

      Video concept:
      ${payload.prompt}

      Format the response as a single paragraph without any prefixes or labels.`,
      maxTokens: 100
    })

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })

    logger.log('Generating first frame with Flux')
    const fluxOutput = await replicate.run('black-forest-labs/flux-1.1-pro', {
      input: {
        prompt: text,
        aspect_ratio: '1:1',
        output_format: 'webp',
        output_quality: 80,
        safety_tolerance: 2,
        prompt_upsampling: true
      }
    })

    // Upload first frame to R2
    const imageKey = `generated-images/${crypto.randomUUID()}.webp`
    const imageResponse = await fetch(fluxOutput as unknown as string)
    const imageBuffer = await imageResponse.arrayBuffer()

    const imagePutCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
      Key: imageKey,
      Body: Buffer.from(imageBuffer),
      ContentType: 'image/webp'
    })
    await R2.send(imagePutCommand)

    // Get signed URL for the first frame
    const imageGetCommand = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
      Key: imageKey
    })
    const imageSignedUrl = await getSignedUrl(R2, imageGetCommand, {
      expiresIn: 3600
    })

    logger.log('Starting video generation with generated first frame')
    const videoOutput = await replicate.run('minimax/video-01', {
      input: {
        prompt: payload.prompt,
        first_frame_image: imageSignedUrl
      }
    })

    const videoKey = `renders/${crypto.randomUUID()}.mp4`
    const videoResponse = await fetch(videoOutput as unknown as string)
    const videoBuffer = await videoResponse.arrayBuffer()

    const videoPutCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
      Key: videoKey,
      Body: Buffer.from(videoBuffer),
      ContentType: 'video/mp4'
    })
    await R2.send(videoPutCommand)

    const videoGetCommand = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
      Key: videoKey
    })
    const videoSignedUrl = await getSignedUrl(R2, videoGetCommand, {
      expiresIn: 3600
    })

    logger.log('Video generation completed', { videoSignedUrl, imageSignedUrl })

    return {
      videoUrl: videoSignedUrl,
      firstFrameUrl: imageSignedUrl
    }
  }
})
