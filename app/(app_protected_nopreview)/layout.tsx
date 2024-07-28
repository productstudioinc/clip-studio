import { getUser } from '@/actions/auth/user';
import { Dashboard } from '@/components/dashboard';

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user } = await getUser();
	return (
		<Dashboard showVideoPreview={false} user={user}>
			{children}
		</Dashboard>
	);
}
