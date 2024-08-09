'use client';

import { signOut } from '@/actions/auth/user';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
	user: User;
}

export function UserAccountMenu({ user }: UserAccountNavProps) {
	const router = useRouter();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary"
				>
					<img
						src={user?.user_metadata.avatar_url}
						alt="User avatar"
						className="w-5 h-5 rounded-full"
					/>
					<span className="text-sm font-medium truncate">{user?.user_metadata.full_name}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/account">
						<UserIcon className="mr-2 h-5 w-5" />
						<span>Account Settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={async () => {
						await signOut();
						router.refresh();
					}}
				>
					<LogOut className="mr-2 h-5 w-5" />
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
