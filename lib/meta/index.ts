import { FacebookTracking } from '@/lib/meta/tracking'

export const facebook = new FacebookTracking({
  pixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  debug: true,
  testCode: process.env.NODE_ENV === 'development' ? 'TEST61113' : undefined
})
