import { withContentCollections } from '@content-collections/next'
import { withAxiom } from 'next-axiom'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.clip.studio',
        pathname: '/**'
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*'
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/affiliate',
        destination: 'https://clipstudio.tolt.io',
        permanent: true
      },
      {
        source: '/discord',
        destination: 'https://discord.gg/Qg4H9dWVv3',
        permanent: true
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:all*(mp4|webm|ogg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  skipTrailingSlashRedirect: true
}

export default withContentCollections(withAxiom(nextConfig))
