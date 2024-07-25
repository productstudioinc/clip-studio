import { Dashboard } from '@/components/dashboard';
import { getUser } from '@/utils/actions/user';

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
