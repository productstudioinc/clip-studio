import { getBackgrounds } from '@/utils/actions/getData';
import { BackgroundSelect } from './background-select';
import ConfigureControls from './configure-controls';

export default async function ConfigurePage() {
	const backgrounds = await getBackgrounds();
	return (
		<div className="flex flex-col">
			<ConfigureControls />
			<BackgroundSelect backgrounds={backgrounds} />
		</div>
	);
}
