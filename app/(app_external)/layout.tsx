<<<<<<< HEAD
import { getUser } from '@/actions/auth/user';
import { Dashboard } from '@/components/dashboard';

export default async function RootLayout({
	children
}: Readonly<{
=======
interface AuthLayoutProps {
>>>>>>> 8b25cb8dfc3010dc91459a3aaf2936df889f5649
	children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex h-screen mx-auto max-w-sm flex-col items-center justify-center">
			{children}
		</div>
	);
}
