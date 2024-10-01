import { siteConfig } from '@/lib/config';
import { Metadata } from 'next';

export function absoluteUrl(path: string) {
	return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
}

export function constructMetadata({
	title = siteConfig.name,
	description = siteConfig.description,
	image = absoluteUrl('/og'),
	...props
}: {
	title?: string;
	description?: string;
	image?: string;
	[key: string]: Metadata[keyof Metadata];
}): Metadata {
	return {
		title: {
			template: '%s | ' + siteConfig.name,
			default: title || siteConfig.name
		},
		description: description || siteConfig.description,
		keywords: siteConfig.keywords,
		openGraph: {
			title,
			description,
			url: siteConfig.url,
			siteName: siteConfig.name,
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: title
				}
			],
			type: 'website',
			locale: 'en_US'
		},
		icons: '/favicon.ico',
		metadataBase: new URL(siteConfig.url),
		authors: [
			{
				name: siteConfig.name,
				url: siteConfig.url
			}
		],
		...props
	};
}
