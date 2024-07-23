'use client';
import { Player } from '@remotion/player';
import useTemplateConfig from '../stores/templateConfig';

export const VideoPreview = () => {
	const {
		component: CompositionComponent,
		state: inputProps,
		durationInFrames
	} = useTemplateConfig();

	return (
		<div className="w-full h-full flex items-center justify-center">
			<div className="w-full h-full max-w-[calc(100vh*9/16)] aspect-[9/16]">
				<Player
					component={CompositionComponent as any}
					inputProps={inputProps}
					durationInFrames={durationInFrames}
					fps={30}
					compositionHeight={1280}
					compositionWidth={720}
					style={{ width: '100%', height: '100%' }}
					controls
					autoPlay
					loop
					initiallyMuted
				/>
			</div>
		</div>
	);
};
