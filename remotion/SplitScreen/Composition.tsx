import { CSSProperties, useCallback, useEffect, useState } from 'react';
import {
	AbsoluteFill,
	cancelRender,
	continueRender,
	delayRender,
	OffthreadVideo,
	Sequence,
	Series,
	useVideoConfig
} from 'remotion';
import { SplitScreenVideoProps } from '../../stores/templatestore';
import Subtitle from '../Shared/Subtitle';

export type SubtitleProp = {
	startFrame: number;
	endFrame: number;
	text: string;
};

const FPS = 30;

export const SplitScreenComposition = ({
	videoUrl,
	type,
	backgroundUrls,
	transcription,
	captionStyle
}: SplitScreenVideoProps) => {
	const videoConfig = useVideoConfig();
	const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);
	const [handle] = useState(() => delayRender());

	const generateSubtitles = useCallback(() => {
		try {
			const { chunks } = transcription;
			const subtitlesData: SubtitleProp[] = [];
			for (let i = 0; i < chunks.length; i++) {
				const { timestamp, text } = chunks[i];
				const startFrame = Math.floor(timestamp[0] * FPS);
				const endFrame = Math.floor(timestamp[1] * FPS);
				subtitlesData.push({
					startFrame,
					endFrame,
					text
				});
			}
			setSubtitles(subtitlesData);
			continueRender(handle);
		} catch (e) {
			console.error('Error in generateSubtitles:', e);
			cancelRender(e);
		}
	}, [transcription, handle]);

	useEffect(() => {
		generateSubtitles();
	}, [generateSubtitles]);

	const videoStyle: CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover'
	};

	const subtitleStyle: CSSProperties = {
		position: 'absolute',
		bottom: '10%',
		width: '100%',
		textAlign: 'center',
		fontSize: '24px',
		color: 'white',
		textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
	};

	const overlayStyle: CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		display: type === 'blob' ? 'flex' : 'none',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10
	};

	const uploadingTextStyle: CSSProperties = {
		fontSize: '32px',
		fontWeight: 'bold',
		color: 'white',
		textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
	};

	return (
		<AbsoluteFill>
			<div style={{ position: 'absolute', top: 0, width: '100%', height: '50%' }}>
				<OffthreadVideo src={videoUrl} style={videoStyle} />
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					width: '100%',
					height: '50%'
				}}
			>
				<Series>
					{backgroundUrls.map((part, index) => (
						<Series.Sequence durationInFrames={FPS * 60} key={index}>
							<OffthreadVideo src={part} startFrom={0} endAt={FPS * 60} style={videoStyle} muted />
						</Series.Sequence>
					))}
				</Series>
			</div>
			{subtitles.map((subtitle, index) =>
				subtitle.startFrame < subtitle.endFrame ? (
					<Sequence
						from={subtitle.startFrame}
						durationInFrames={subtitle.endFrame - subtitle.startFrame}
						key={index}
					>
						<div style={subtitleStyle}>
							<Subtitle text={subtitle.text} captionStyle={captionStyle} />
						</div>
					</Sequence>
				) : null
			)}
			<div style={overlayStyle}>
				<div style={uploadingTextStyle}>Uploading video...</div>
			</div>
		</AbsoluteFill>
	);
};
