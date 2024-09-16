import { withContentCollections } from '@content-collections/next';
import { withAxiom } from 'next-axiom';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
		];
	},
	async redirects() {
		return [
			{
				source: '/affiliate',
				destination: 'https://clipstudio.tolt.io',
				permanent: true
			}
		];
	},
	skipTrailingSlashRedirect: true
};

export default withContentCollections(withAxiom(nextConfig));
