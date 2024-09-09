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
					<div className="w-full flex-1"></div>
					<ModeToggle />
				</header>
				<main className="flex flex-col overflow-scroll flex-1 bg-muted/40 p-4 md:p-10">
					{children}
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
