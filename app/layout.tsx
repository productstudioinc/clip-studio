import { Dashboard } from '@/components/dashboard';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import { getUser } from '@/utils/actions/user';
import { HighlightInit } from '@highlight-run/next/client';
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
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user } = await getUser();
	return (
		<>
			<HighlightInit
				projectId={process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				serviceName="clip-studio"
				tracingOrigins
				disableSessionRecording
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
			/>
			<html lang="en">
				<PHProvider>
					<body className={GeistSans.className}>
						<PostHogPageView />
						<ThemeProvider attribute="class" defaultTheme="light">
							<Dashboard user={user}>{children}</Dashboard>
							<Toaster position="top-right" />
						</ThemeProvider>
					</body>
				</PHProvider>
			</html>
		</>
	);
}
