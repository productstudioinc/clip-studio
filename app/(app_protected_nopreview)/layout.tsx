import { getUser, getUserSubscription } from '@/actions/auth/user';
import { Dashboard } from '@/components/dashboard';

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [{ user }, subscriptionData] = await Promise.all([getUser(), getUserSubscription()]);
	return (
		<Dashboard showVideoPreview={false} user={user} subscription={subscriptionData}>
			{children}
		</Dashboard>
	);
}
