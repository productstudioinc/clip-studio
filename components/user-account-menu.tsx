'use client';

import { signOut } from '@/actions/auth/user';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User } from '@supabase/supabase-js';
import { ChevronsUpDown, LogOut, MoonIcon, SunIcon, User as UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
	user: User;
}

export function UserAccountMenu({ user }: UserAccountNavProps) {
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="w-full rounded-md outline-none ring-ring hover:bg-accent focus-visible:ring-2 data-[state=open]:bg-accent">
				<div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm transition-all">
					<Avatar className="h-7 w-7 rounded-md border">
						<AvatarImage
							src={user?.user_metadata.avatar_url}
							alt={user?.user_metadata.full_name}
							className="animate-in fade-in-50 zoom-in-90"
						/>
						<AvatarFallback className="rounded-md">
							{user?.user_metadata.full_name?.charAt(0) || 'U'}
						</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 leading-none">
						<div className="font-medium">{user?.user_metadata.full_name}</div>
						<div className="overflow-hidden text-xs text-muted-foreground">
							<div className="line-clamp-1">{user?.email}</div>
						</div>
					</div>
					<ChevronsUpDown className="ml-auto mr-0.5 h-4 w-4 text-muted-foreground/50" />
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" side="right" sideOffset={4}>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm transition-all">
						<Avatar className="h-7 w-7 rounded-md">
							<AvatarImage
								src={user?.user_metadata.avatar_url}
								alt={user?.user_metadata.full_name}
							/>
							<AvatarFallback>{user?.user_metadata.full_name?.charAt(0) || 'U'}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1">
							<div className="font-medium">{user?.user_metadata.full_name}</div>
							<div className="overflow-hidden text-xs text-muted-foreground">
								<div className="line-clamp-1">{user?.email}</div>
							</div>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/account" className="flex items-center gap-2">
							<UserIcon className="h-4 w-4 text-muted-foreground" />
							Account Settings
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
						<div className="flex gap-2 items-center">
							{theme === 'dark' ? (
								<SunIcon className="h-4 w-4" />
							) : (
								<MoonIcon className="h-4 w-4" />
							)}
							<span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link
							href="https://discord.gg/AVRVrVHTwQ"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2"
						>
							<Icons.discord className="h-4 w-4 text-muted-foreground" />
							Join Discord
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={async () => {
						await signOut();
						router.refresh();
					}}
					className="flex items-center gap-2"
				>
					<LogOut className="h-4 w-4 text-muted-foreground" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
