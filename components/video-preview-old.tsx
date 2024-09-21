'use client';

import useTemplateConfig from '@/stores/templateConfig';
import { VIDEO_FPS } from '@/stores/templatestore';
import { Player } from '@remotion/player';
import React from 'react';

export const VideoPreview: React.FC = () => {
	const {
		component: CompositionComponent,
		state: inputProps,
		durationInFrames
	} = useTemplateConfig();

	return (
		<div
			className={`w-full h-full flex items-center justify-center max-w-[calc(100vh*9/16)] aspect-[9/16]`}
		>
			<Player
				component={CompositionComponent as any}
				className="rounded-md"
				style={{ width: '100%', height: '100%' }}
				inputProps={inputProps}
				durationInFrames={durationInFrames}
				fps={VIDEO_FPS}
				compositionHeight={1280}
				compositionWidth={720}
				controls
				autoPlay
				loop
				initiallyMuted
			/>
		</div>
	);
};
