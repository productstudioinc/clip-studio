import { getUser, getUserSubscription } from '@/actions/auth/user';
import { getUserUsage } from '@/actions/db/user-queries';
import HeroWrapper from '@/components/hero-wrapper';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { Sidebar } from '@/components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
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
		<div className="flex min-h-screen">
			<aside className="hidden md:flex md:w-64 flex-col border-r bg-muted/40 sticky top-0 h-screen">
				<div className="p-4 border-b">
					<HeroWrapper />
				</div>
				<Sidebar user={user} subscription={subscriptionData} usage={usage} />
			</aside>
			<div className="flex flex-col flex-1">
				<header className="flex items-center justify-between p-2 border-b sticky top-0 z-10 bg-background">
					<MobileSidebar user={user} />
					<ModeToggle />
				</header>
				<main className="flex-1 bg-muted/40 relative">{children}</main>
				<footer className="border-t p-4 text-sm">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<span>
							© {new Date().getFullYear()} <Link href="/">Clip Studio</Link> - AI Generated Videos
						</span>
						<nav className="mt-2 md:mt-0">
							<Link href="/privacy" className="mr-4">
								Privacy Policy
							</Link>
							<Link href="/terms">Terms of Service</Link>
						</nav>
					</div>
				</footer>
			</div>
		</div>
	);
}
