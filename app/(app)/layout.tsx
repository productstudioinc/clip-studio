import { getUser, getUserSubscription } from '@/actions/auth/user';
import { getUserUsage } from '@/actions/db/user-queries';
import Hero from '@/components/hero';
import { Icons } from '@/components/icons';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { Sidebar } from '@/components/sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { VideoPreview } from '@/components/video-preview';
import React from 'react';

export default async function RootLayout({
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
		<div className="grid min-h-screen w-full md:grid-cols-[250px_1fr]">
			<div className="hidden border-r bg-muted/40 md:block">
				<div className="flex h-full max-h-screen flex-col gap-2">
					<div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
						<Dialog>
							<DialogTrigger asChild>
								<Button
									variant="link"
									className="flex w-full items-center justify-start gap-2 px-2 p-0 font-semibold"
								>
									<Icons.logo className="w-4 h-4" />
									<span>Clip Studio</span>
								</Button>
							</DialogTrigger>
							<DialogContent>
								<Hero />
							</DialogContent>
						</Dialog>
					</div>
					<Sidebar user={user} subscription={subscriptionData} usage={usage} />
				</div>
			</div>
			<div className="flex flex-col h-screen">
				<header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
					<MobileSidebar user={user} />
					<div className="w-full flex-1"></div>
					<ModeToggle />
				</header>
				<main className="flex flex-col p-4 lg:p-6 flex-grow overflow-hidden">
					<div className="flex items-center mb-4">
						{/* <h1 className="text-lg font-semibold md:text-2xl">{getTitle(currentRoute)}</h1> */}
					</div>

					<div className="flex flex-col lg:flex-row gap-4 min-h-0 flex-grow">
						<div className="w-full lg:w-1/2 overflow-hidden flex flex-col">
							<div className="flex-grow overflow-auto rounded-lg border shadow-sm p-4">
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
