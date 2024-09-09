import { getUser } from '@/actions/auth/user';
import { getProducts } from '@/actions/db/user-queries';
import PricingDialog from '@/components/pricing-dialog';

export default async function Page() {
	const [products, { user }] = await Promise.all([getProducts(), getUser()]);
	return <PricingDialog products={products} user={user} />;
}
