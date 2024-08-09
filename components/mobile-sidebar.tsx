'use client';

import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserAccountMenu } from '@/components/user-account-menu';
import { cn } from '@/lib/utils';
import { useTemplateStore } from '@/stores/templatestore';
import { User } from '@supabase/supabase-js';
import {
	CaptionsIcon,
	CircleUser,
	CogIcon,
	FileText,
	FileUpIcon,
	LayoutTemplateIcon,
	LucideIcon,
	Menu,
	MicVocalIcon,
	UserIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';

interface NavItem {
	href: string;
	icon: LucideIcon;
	label: string;
}

interface NavLinkProps extends NavItem {
	currentRoute: string;
}

interface MobileSidebarProps {
	user: User | null;
	children?: ReactNode;
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

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ user }) => {
	const currentRoute = usePathname();

	const { selectedTemplate } = useTemplateStore((state) => ({
		selectedTemplate: state.selectedTemplate
	}));

	const navItems: NavItem[] = [
		{ href: '/', icon: LayoutTemplateIcon, label: 'Templates' },
		{ href: '/configure', icon: CogIcon, label: 'Configure' },
		{
			href: selectedTemplate === 'SplitScreen' ? '/caption' : '/voiceover',
			icon: selectedTemplate === 'SplitScreen' ? CaptionsIcon : MicVocalIcon,
			label: selectedTemplate === 'SplitScreen' ? 'Caption' : 'Voiceover'
		},
		{ href: '/export', icon: FileUpIcon, label: 'Export' }
	];

	const profileNavItem: NavItem = {
		href: '/account',
		icon: UserIcon,
		label: 'My Account'
	};

	const bottomNavItems: NavItem[] = [
		{ href: '/terms', icon: FileText, label: 'Terms of Service' },
		{ href: '/privacy', icon: FileText, label: 'Privacy Policy' }
	];

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" className="shrink-0 md:hidden">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Toggle navigation menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="flex flex-col">
				<nav className="grid gap-2 text-lg font-medium">
					<Link href="/" className="flex items-center gap-2 text-lg font-semibold">
						<Icons.logo className="w-4 h-4" />
						<span className="">Clip Studio</span>
					</Link>
					{navItems.map((item) => (
						<NavLink key={item.href} {...item} currentRoute={currentRoute} />
					))}
					<Separator orientation="horizontal" className="my-2" />
					<NavLink {...profileNavItem} currentRoute={currentRoute} />
					{bottomNavItems.map((item) => (
						<NavLink key={item.href} {...item} currentRoute={currentRoute} />
					))}
					{user ? (
						<UserAccountMenu user={user} />
					) : (
						<Link
							href="/login"
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary text-lg'
							)}
						>
							<CircleUser className="h-4 w-4" />
							Login
						</Link>
					)}
				</nav>
			</SheetContent>
		</Sheet>
	);
};
