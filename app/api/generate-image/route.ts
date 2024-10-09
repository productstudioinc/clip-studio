import { NextRequest, NextResponse } from 'next/server'
import { VisualStyle } from '@/stores/templatestore'
import { R2 } from '@/utils/r2'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Logger } from 'next-axiom'

const promptMap: Record<VisualStyle, string> = {
  [VisualStyle.Realistic]:
    'professional 3d model {prompt}. octane render, highly detailed, volumetric, dramatic lighting',
  [VisualStyle.Anime]:
    'anime artwork {prompt} . anime style, key visual, vibrant, studio anime, highly detailed',
  [VisualStyle.Neopunk]:
    'neonpunk style {prompt} . cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern',
  [VisualStyle.JapaneseInk]:
    'Japanese ink wash painting {prompt} . sumi-e style, brush strokes, monochrome, Zen-like simplicity',
  [VisualStyle.LineArt]:
    'line art drawing {prompt} . professional, sleek, modern, minimalist, graphic, line art, vector graphics',
  [VisualStyle.Medieval]:
    'gothic fantasy {prompt} . dark and brooding atmosphere, medieval architecture, mythical creatures',
  [VisualStyle.Cinematic]:
    'cinematic still {prompt} . emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, gorgeous, film grain, grainy',
  [VisualStyle.Playdoh]:
    'play-doh style {prompt} . sculpture, clay art, centered composition, Claymation'
}

const logger = new Logger({
  source: 'api/generate-image'
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, visualStyle } = await request.json()

    if (!prompt || !visualStyle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const stylePrompt = promptMap[visualStyle as VisualStyle].replace(
      '{prompt}',
      prompt
    )
    const encodedPrompt = encodeURIComponent(stylePrompt)

    const response = await fetch(
      `${process.env.FLUX_MODAL_URL}?prompt=${encodedPrompt}&negative_prompt=blurry, washed out, flat, messy, pixelated`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.FLUX_API_KEY!
        }
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        logger.error('Authentication failed for image generation API', {
          status: response.status,
          statusText: response.statusText
        })
        return NextResponse.json(
          {
            error:
              'Failed to authenticate with the image generation service. Please check your API key.'
          },
          { status: 401 }
        )
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const s3Key = `generated-images/${crypto.randomUUID()}.png`

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(imageBuffer),
      ContentType: 'image/png'
    })

    await R2.send(putObjectCommand)

    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_USER_BUCKET_NAME,
      Key: s3Key
    })

    const signedUrl = await getSignedUrl(R2, getObjectCommand, {
      expiresIn: 3600
    })

    logger.info('Image generated and uploaded successfully', { signedUrl })
    await logger.flush()

    return NextResponse.json({ signedUrl })
  } catch (error) {
    logger.error('Error generating or uploading image', {
      error: error instanceof Error ? error.message : String(error)
    })
    await logger.flush()
    return NextResponse.json(
      { error: 'An error occurred while generating the image.' },
      { status: 500 }
    )
  }
}
