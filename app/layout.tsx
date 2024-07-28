import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { PHProvider } from './_analytics/provider';

const PostHogPageView = dynamic(() => import('./_analytics/PostHogPageView'), {
	ssr: false
});

export const metadata: Metadata = {
	title: 'Clip Studio'
};

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
				<PHProvider>
					<body className={GeistSans.className}>
						<PostHogPageView />
						<ThemeProvider attribute="class" defaultTheme="light">
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
