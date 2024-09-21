import { getUser, getUserSubscription } from '@/actions/auth/user';
import { getUserUsage } from '@/actions/db/user-queries';
import HeroWrapper from '@/components/hero-wrapper';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { PageSwitcher } from '@/components/page-switcher';
import { ResetSettings } from '@/components/reset-settings';
import { Sidebar } from '@/components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { VideoPreview } from '@/components/video-preview-old';
import Link from 'next/link';
import React from 'react';

export default async function Layout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [{ user }, subscriptionData, usage] = await Promise.all([
		getUser(),
		getUserSubscription(),
		getUserUsage()
	]);

	return (
		<div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
			<div className="hidden border-r bg-muted/40 md:block">
				<div className="flex h-full max-h-screen flex-col gap-2">
					<div className="flex min-h-14 items-center border-b px-4 lg:px-6">
						<HeroWrapper />
					</div>
					<Sidebar user={user} subscription={subscriptionData} usage={usage} />
				</div>
			</div>
			<div className="flex flex-col h-screen">
				<header className="flex items-center gap-4 border-b bg-muted/40 px-4 lg:px-6 min-h-14">
					<MobileSidebar user={user} />
					<PageSwitcher />
					<ResetSettings />
					<div className="flex-1"></div>
					<ModeToggle />
				</header>
				<main className="flex flex-col p-4 lg:p-6 flex-grow overflow-hidden">
					<div className="flex items-center mb-4">
						{/* <h1 className="text-lg font-semibold md:text-2xl">{getTitle(currentRoute)}</h1> */}
					</div>

					<div className="flex flex-col lg:flex-row gap-3 min-h-0 flex-grow">
						<div className="w-full lg:w0/2 overflow-hidden flex flex-col">
							<div className="flex-grow overflow-auto rounded-lg border shadow-sm p-3 flex flex-col">
								{children}
							</div>
						</div>
						<div className="w-full lg:w-1/2 flex items-center justify-center bg-muted rounded-lg">
							<div className="w-full h-full max-h-[calc(50vw*16/9)] lg:max-h-[calc((100vh-60px-2rem)*0.9)] aspect-[9/16]">
								<VideoPreview />
							</div>
						</div>
					</div>
				</main>
				<footer className="px-4 mx-auto border-t py-2 grid md:grid-cols-2 justify-between w-full grid-cols-1 gap-1">
					<span className="text-sm tracking-tight text-foreground">
						Copyright © {new Date().getFullYear()}{' '}
						<Link href="/" className="cursor-pointer">
							Clip Studio
						</Link>{' '}
						- AI Generated Videos
					</span>
					<ul className="flex justify-start md:justify-end text-sm tracking-tight text-foreground">
						<li className="mr-3 md:mx-4">
							<Link href="/privacy" target="_blank" rel="noopener noreferrer">
								Privacy Policy
							</Link>
						</li>
						<li className="mr-3 md:mx-4">
							<Link href="/terms" target="_blank" rel="noopener noreferrer">
								Terms of Service
							</Link>
						</li>
					</ul>
				</footer>
			</div>
		</div>
	);
}
