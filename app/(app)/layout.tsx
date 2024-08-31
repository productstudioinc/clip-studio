import { getUser, getUserSubscription } from '@/actions/auth/user';
import { getUserUsage } from '@/actions/db/user-queries';
import HeroWrapper from '@/components/hero-wrapper';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { Sidebar } from '@/components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
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
		<div className="grid min-h-screen w-full md:grid-cols-[210px_1fr]">
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
					<div className="w-full flex-1"></div>
					<ModeToggle />
				</header>
				{children}
			</div>
		</div>
	);
}
