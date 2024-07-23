import { Metadata } from 'next';

export function absoluteUrl(path: string) {
	return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function constructMetadata({
	title = 'Clip Studio | AI-Generated Video Clips',
	description = 'Clip Studio is a tool for creating AI-generated video clips.',
	image = absoluteUrl('/og'), // TODO: implement
	...props
}: {
	title?: string;
	description?: string;
	image?: string;
	[key: string]: Metadata[keyof Metadata];
}): Metadata {
	return {
		title,
		description,
		keywords: [
			'AI video',
			'AI-generated clips',
			'video generation',
			'AI content creation',
			'automated video production'
		],
		openGraph: {
			title,
			description,
			type: 'website',
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: title
				}
			]
		},
		icons: '/favicon.ico',
		metadataBase: new URL('https://clip.studio'),
		authors: [
			{
				name: 'Clip Studio',
				url: 'https://twitter.com/useclipstudio'
			}
		],
		...props
	};
}
