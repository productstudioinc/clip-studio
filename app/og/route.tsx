import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

import { siteConfig } from '@/lib/config'
import { Icons } from '@/components/icons'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const postTitle = siteConfig.name
  const font = fetch(
    new URL('../../assets/fonts/Inter-SemiBold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())
  const fontData = await font

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: `url(${siteConfig.url}/og.png)`,
          fontSize: 32,
          fontWeight: 600,
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '50px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          <img
            src={`${siteConfig.url}/instagram.png`}
            alt="Instagram"
            width="64"
            height="64"
            style={{
              transform: 'rotate(-15deg)',
              marginRight: '12px'
            }}
          />
          <img
            src={`${siteConfig.url}/tiktok.png`}
            alt="TikTok"
            width="80"
            height="80"
            style={{
              transform: 'rotate(10deg)'
            }}
          />
          <img
            src={`${siteConfig.url}/youtube.png`}
            alt="YouTube"
            width="64"
            height="64"
            style={{
              transform: 'rotate(-5deg)'
            }}
          />
        </div>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            top: '125px'
          }}
        >
          <Icons.logo
            style={{
              width: '64px',
              height: '64px'
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '64px',
              fontWeight: '600',
              marginTop: '24px',
              textAlign: 'center',
              width: '80%',
              letterSpacing: '-0.05em' // Added tighter tracking
            }}
          >
            {postTitle}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              maxWidth: '60%',
              textAlign: 'center',
              fontWeight: '500',
              marginTop: '16px',
              color: '#808080'
            }}
          >
            {siteConfig.description}
          </div>
        </div>

        <img
          src={`${siteConfig.url}/clips.png`}
          width={1000}
          height={500}
          style={{
            position: 'relative',
            bottom: -180,
            aspectRatio: 'auto',
            border: '4px solid lightgray',
            background: 'lightgray',
            borderRadius: 20,
            zIndex: 1
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal'
        }
      ]
    }
  )
}
