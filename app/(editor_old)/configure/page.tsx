import { getBackgrounds } from '@/actions/db/page-data';
import { BackgroundSelect } from './background-select';
import ConfigureControls from './configure-controls';

export default async function ConfigurePage() {
	const backgrounds = await getBackgrounds();
	return (
		<div className="flex flex-col space-y-6">
			<ConfigureControls />
			<BackgroundSelect backgrounds={backgrounds} />
		</div>
	);
}
