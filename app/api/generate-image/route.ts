import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/actions/auth/user'
import { db } from '@/db'
import { templates, userUploads, userUsage } from '@/db/schema'
import { VisualStyle } from '@/stores/templatestore'
import { CREDIT_CONVERSIONS } from '@/utils/constants'
import { R2 } from '@/utils/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { eq, sql } from 'drizzle-orm'
import { Logger } from 'next-axiom'

export const maxDuration = 300

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
    'line art drawing {prompt} . professional, sleek, modern, minimalist, graphic, line art, vector graphics, colored',
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

async function saveImageUpload(userId: string, url: string, tags?: string[]) {
  const template = await db.query.templates.findFirst({
    where: eq(templates.value, 'AIVideo')
  })

  if (!template) {
    throw new Error('AIVideo template not found')
  }

  return db.insert(userUploads).values({
    userId,
    url,
    tags: tags || []
  })
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, visualStyle } = await request.json()

    if (!prompt || !visualStyle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { user } = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to use this feature.' },
        { status: 401 }
      )
    }

    // Set required credits to exactly 10
    const requiredCredits = CREDIT_CONVERSIONS.IMAGE_GENERATION

    // Check user's available credits
    const userUsageRecord = await db
      .select({ creditsLeft: userUsage.creditsLeft })
      .from(userUsage)
      .where(eq(userUsage.userId, user.id))

    if (userUsageRecord.length === 0 || !userUsageRecord[0].creditsLeft) {
      logger.error('User does not have a subscription', { userId: user.id })
      return NextResponse.json(
        { error: 'You need an active subscription to use this feature.' },
        { status: 403 }
      )
    }

    if (userUsageRecord[0].creditsLeft < requiredCredits) {
      logger.error('Insufficient credits', {
        userId: user.id,
        requiredCredits,
        availableCredits: userUsageRecord[0].creditsLeft
      })
      return NextResponse.json(
        { error: "You don't have enough credits to generate this image." },
        { status: 403 }
      )
    }

    // Deduct exactly 10 credits
    await db
      .update(userUsage)
      .set({
        creditsLeft: sql`${userUsage.creditsLeft} - ${requiredCredits}`
      })
      .where(eq(userUsage.userId, user.id))

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
      // If an error occurred, refund the credits
      await db
        .update(userUsage)
        .set({
          creditsLeft: sql`${userUsage.creditsLeft} + ${requiredCredits}`
        })
        .where(eq(userUsage.userId, user.id))

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

    const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL}/${s3Key}`

    // Save to userUploads
    await saveImageUpload(user.id, publicUrl, ['AI', 'Image'])

    logger.info('Image generated and uploaded successfully', {
      publicUrl,
      userId: user.id
    })
    await logger.flush()

    return NextResponse.json({ signedUrl: publicUrl })
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
