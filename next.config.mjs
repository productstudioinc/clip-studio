import { withContentCollections } from '@content-collections/next';

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
	productionBrowserSourceMaps: true,
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.devtool = 'source-map';
		}
		return config;
	}
};

export default withContentCollections(nextConfig);
