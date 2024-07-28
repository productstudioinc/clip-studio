import { getUser } from '@/actions/auth/user';
import { Dashboard } from '@/components/dashboard';

export default async function RootLayout({
	children,
	auth
}: Readonly<{
	children: React.ReactNode;
	auth: React.ReactNode;
}>) {
	const { user } = await getUser();
	return (
		<Dashboard user={user}>
			{auth}
			{children}
		</Dashboard>
	);
}
