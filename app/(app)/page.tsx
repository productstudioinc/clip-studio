import { getTemplates } from '@/actions/db/page-data';
import { TemplateSelect } from '@/components/template-select';

export default async function TemplatesPage() {
	const [templates] = await Promise.all([getTemplates()]);

	return <TemplateSelect templates={templates} />;
}
