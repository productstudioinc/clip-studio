import { ErrorToast } from '@/components/error-toast';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { constructMetadata } from '@/lib/seo-utils';
import '@/styles/globals.css';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { AxiomWebVitals } from 'next-axiom';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PHProvider } from './_analytics/provider';

const PostHogPageView = dynamic(() => import('./_analytics/PostHogPageView'), {
	ssr: false
});

export const metadata: Metadata = constructMetadata({});

export default async function RootLayout({
	children,
	auth
}: Readonly<{
	children: React.ReactNode;
	auth: React.ReactNode;
}>) {
	return (
		<>
			<html lang="en">
				<AxiomWebVitals />
				<PHProvider>
					<body className={GeistSans.className}>
						<Suspense fallback={<></>}>
							<ErrorToast />
						</Suspense>
						<PostHogPageView />
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{auth}
							{children}
							<Toaster position="top-right" />
						</ThemeProvider>
					</body>
				</PHProvider>
			</html>
		</>
	);
}
