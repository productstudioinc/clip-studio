import { getProducts } from '@/actions/db/user-queries';

export default async function Page() {
	const products = await getProducts();
	return <>{JSON.stringify(products)}</>;
}
