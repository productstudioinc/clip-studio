import { getUser } from '@/actions/auth/user';
import { getProducts } from '@/actions/db/user-queries';
import Faq from '@/components/faq';
import Pricing from '@/components/pricing';

export default async function Page() {
	const [products, { user }] = await Promise.all([getProducts(), getUser()]);

	return (
		<>
			<Pricing products={products} user={user} />
			<Faq />
		</>
	);
}
