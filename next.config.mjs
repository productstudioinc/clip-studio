import { withContentCollections } from '@content-collections/next';
import { withHighlightConfig } from '@highlight-run/next/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true
	},
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
	skipTrailingSlashRedirect: true,
	experimental: {
		instrumentationHook: true
	},
	serverExternalPackages: ['@highlight-run/node']
};

export default withHighlightConfig(withContentCollections(nextConfig), {
	uploadSourceMaps: true
});
