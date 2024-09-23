import { ErrorToast } from '@/components/error-toast';
import { LocalStorageTools } from '@/components/local-storage-tools';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { constructMetadata } from '@/lib/seo-utils';
import '@/styles/globals.css';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { AxiomWebVitals } from 'next-axiom';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { Suspense } from 'react';
import { PHProvider } from './_analytics/provider';

const PostHogPageView = dynamic(() => import('./_analytics/PostHogPageView'), {
	ssr: false
});

export const metadata: Metadata = constructMetadata({});

export default async function RootLayout({
	children,
	modal
}: Readonly<{
	children: React.ReactNode;
	modal: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<Script src="https://cdn.tolt.io/tolt.js" data-tolt="4196373f-07fe-4d9a-927b-5aa9c7952153" />
			<AxiomWebVitals />
			<PHProvider>
				<body className={GeistSans.className}>
					<Suspense fallback={<></>}>
						<ErrorToast />
					</Suspense>
					<PostHogPageView />
					<LocalStorageTools />
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{modal}
						{children}
						<Toaster position="top-right" />
					</ThemeProvider>
				</body>
			</PHProvider>
		</html>
	);
}
