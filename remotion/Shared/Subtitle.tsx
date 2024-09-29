import { CaptionStyle } from '@/stores/templatestore';
import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Word } from './Word';

const Subtitle: React.FC<{ text: string; captionStyle: CaptionStyle }> = ({
	text,
	captionStyle
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const enter = spring({
		frame,
		fps,
		config: {
			damping: 200
		},
		durationInFrames: 5
	});

	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
			<AbsoluteFill>
				<Word stroke enterProgress={enter} text={text} captionStyle={captionStyle} />
			</AbsoluteFill>
			<AbsoluteFill>
				<Word enterProgress={enter} text={text} stroke={false} captionStyle={captionStyle} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Subtitle;
