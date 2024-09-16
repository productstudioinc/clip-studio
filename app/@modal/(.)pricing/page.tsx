import { getUser, getUserSubscription } from '@/actions/auth/user';
import { getProducts } from '@/actions/db/user-queries';
import PricingDialog from '@/components/pricing-dialog';

export default async function Page() {
	const [products, { user }, subscription] = await Promise.all([
		getProducts(),
		getUser(),
		getUserSubscription()
	]);
	return <PricingDialog products={products} user={user} subscription={subscription ?? null} />;
}
