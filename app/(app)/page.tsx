import { getTemplates } from '@/actions/db/page-data';
import HeroWrapper from '@/components/ui/hero-wrapper';
import { TemplateSelect } from '../template-select';

export default async function TemplatesPage() {
	const [templates] = await Promise.all([getTemplates()]);

	return (
		<>
			<HeroWrapper />
			<TemplateSelect templates={templates} />
		</>
	);
}
