import { getUser, getUserSubscription } from '@/actions/auth/user';
import { getUserUsage } from '@/actions/db/user-queries';
import HeroWrapper from '@/components/hero-wrapper';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { PageSwitcher } from '@/components/page-switcher';
import { Sidebar } from '@/components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { VideoPreview } from '@/components/video-preview';
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
			</div>
		</div>
	);
}
