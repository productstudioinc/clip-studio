import { allPages } from '@/.content-collections/generated';
import LegalPage from '@/components/legal-page';
import { constructMetadata } from '@/lib/seo-utils';
import { Metadata } from 'next';

export const metadata: Metadata = constructMetadata({
	title: 'Privacy Policy | Clip Studio'
});

export default function Privacy() {
	const post = allPages.find((post) => post.slug === 'privacy')!;
	return <LegalPage page={post} />;
}
