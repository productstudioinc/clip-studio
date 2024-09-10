'use client';

import { GetUserSubscriptionResult } from '@/actions/auth/user';
import { GetUserUsageResult } from '@/actions/db/user-queries';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import UpgradeCard from '@/components/upgrade-card';
import { UserAccountMenu } from '@/components/user-account-menu';
import { cn } from '@/lib/utils';
import { useTemplateStore } from '@/stores/templatestore';
import { User } from '@supabase/supabase-js';
import {
	CaptionsIcon,
	DollarSignIcon,
	FilmIcon,
	LayoutTemplateIcon,
	LogInIcon,
	MessageSquareIcon,
	MicIcon,
	Settings2Icon,
	UploadIcon,
	UserIcon,
	type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';
import SubscriptionCard from './subscription-card';

interface NavItem {
	href: string;
	icon: LucideIcon;
	label: string;
}

interface NavLinkProps extends NavItem {
	currentRoute: string;
}

interface SidebarProps {
	user: User | null;
	children?: ReactNode;
	subscription: GetUserSubscriptionResult | undefined;
	usage: GetUserUsageResult;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, currentRoute }) => (
	<Link
		href={href}
		className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
			currentRoute === href ? 'bg-muted text-primary' : 'text-muted-foreground'
		}`}
	>
		<Icon className="h-4 w-4" />
		{label}
	</Link>
);

export const Sidebar: React.FC<SidebarProps> = ({ user, subscription, usage }) => {
	const currentRoute = usePathname();

	const { selectedTemplate } = useTemplateStore((state) => ({
		selectedTemplate: state.selectedTemplate
	}));

	const navItems: NavItem[] = [
		{ href: '/', icon: LayoutTemplateIcon, label: 'Templates' },
		{ href: '/configure', icon: Settings2Icon, label: 'Configure' },
		{
			href: selectedTemplate === 'SplitScreen' ? '/caption' : '/voiceover',
			icon: selectedTemplate === 'SplitScreen' ? CaptionsIcon : MicIcon,
			label: selectedTemplate === 'SplitScreen' ? 'Caption' : 'Voiceover'
		},
		{ href: '/export', icon: UploadIcon, label: 'Export' }
	];

	const profileNavItems: NavItem[] = [
		{
			href: '/projects',
			icon: FilmIcon, // Changed from FileIcon to FilmIcon
			label: 'My Projects'
		},
		{
			href: '/account',
			icon: UserIcon,
			label: 'My Account'
		}
	];

	return (
		<>
			<div className="flex-1">
				<nav className="grid items-start px-2 text-sm font-medium lg:px-4">
					{navItems.map((item) => (
						<NavLink key={item.href} {...item} currentRoute={currentRoute} />
					))}
					<Separator orientation="horizontal" className="my-2" />
					{profileNavItems.map((item) => (
						<NavLink key={item.href} {...item} currentRoute={currentRoute} />
					))}
				</nav>
			</div>
			<div className="px-2 lg:px-4">
				{subscription && usage && user ? (
					<SubscriptionCard subscriptionName={subscription} usage={usage} userId={user?.id} />
				) : (
					<UpgradeCard />
				)}
			</div>
			<div className="px-2 lg:px-4">
				<Link
					href="/affiliate"
					className={cn(buttonVariants({ variant: 'default' }), 'w-full gap-2 rounded-md')}
				>
					<DollarSignIcon className="h-4 w-4 flex-shrink-0" />
					<span>Earn 20% per referral</span>
				</Link>
			</div>

			<div className="px-2 lg:px-4">
				<Link
					href="/feedback"
					className={cn(
						buttonVariants({ variant: 'ghost' }),
						'w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary'
					)}
				>
					<MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
					Submit Feedback
				</Link>
			</div>
			<div className="px-2 lg:px-4">
				<Link
					href="https://discord.gg/AVRVrVHTwQ"
					target="_blank"
					rel="noopener noreferrer"
					className={cn(
						buttonVariants({ variant: 'ghost' }),
						'w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary'
					)}
				>
					<svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
						<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
					</svg>
					Discord
				</Link>
			</div>
			{/* <div className="px-2 lg:px-4">
				<nav className="grid items-start text-sm font-medium">
					{bottomNavItems.map((item) => (
						<NavLink key={item.href} {...item} currentRoute={currentRoute} />
					))}
				</nav>
			</div> */}
			<div className="px-2 lg:px-4 pb-4">
				{user ? (
					<UserAccountMenu user={user} />
				) : (
					<Link
						href="/login"
						className={cn(
							buttonVariants({ variant: 'ghost' }),
							'w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary'
						)}
					>
						<LogInIcon className="h-4 w-4" />
						Login
					</Link>
				)}
			</div>
		</>
	);
};
