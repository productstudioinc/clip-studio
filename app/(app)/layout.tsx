import { getUser, getUserSubscription } from '@/actions/auth/user';
import { getUserUsage } from '@/actions/db/user-queries';
import { Dashboard } from '@/components/dashboard';
import HeroWrapper from '@/components/ui/hero-wrapper';

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [{ user }, subscriptionData, usage] = await Promise.all([
		getUser(),
		getUserSubscription(),
		getUserUsage()
	]);
	return (
		<>
			{!user && <HeroWrapper />}
			<Dashboard user={user} subscription={subscriptionData} usage={usage}>
				{children}
			</Dashboard>
		</>
	);
}
