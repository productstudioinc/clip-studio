import HeroWrapper from '@/components/ui/hero-wrapper';
import { getTemplates } from '@/utils/actions/getData';
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
