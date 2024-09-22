'use client';

import { GetUserSubscriptionResult } from '@/actions/auth/user';
import { GetUserUsageResult } from '@/actions/db/user-queries';
import { Icons } from '@/components/icons';
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
					<Icons.discord className="h-4 w-4 flex-shrink-0" />
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
