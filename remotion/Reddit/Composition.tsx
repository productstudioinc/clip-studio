import { useCallback, useEffect, useState } from 'react';
import {
	AbsoluteFill,
	Audio,
	cancelRender,
	continueRender,
	delayRender,
	OffthreadVideo,
	Sequence,
	Series,
	useVideoConfig
} from 'remotion';
import { z } from 'zod';

import { RedditCard } from '../../components/reddit-card';
import { RedditProps } from '../../stores/templatestore';
import Subtitle from '../Shared/Subtitle';

export type SubtitleProp = {
	startFrame: number;
	endFrame: number;
	text: string;
};

const FPS = 30;

export const RedditComposition = ({
	title,
	subreddit,
	voiceoverUrl,
	voiceoverFrames,
	titleEnd,
	backgroundUrls
}: z.infer<typeof RedditProps>) => {
	const videoConfig = useVideoConfig();
	const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);
	const [handle] = useState(() => delayRender());

	const generateSubtitles = useCallback(() => {
		try {
			const { characters, character_start_times_seconds, character_end_times_seconds } =
				voiceoverFrames;
			const titleEndFrame = Math.floor(titleEnd * FPS);
			const subtitlesData: SubtitleProp[] = [];
			let currentWord = '';
			let wordStartIndex = 0;

			for (let i = 0; i < characters.length; i++) {
				if (characters[i] === ' ' || i === characters.length - 1) {
					if (currentWord) {
						const startFrame = Math.max(
							titleEndFrame,
							Math.floor(character_start_times_seconds[wordStartIndex] * FPS)
						);
						const endFrame = Math.max(
							startFrame + 1,
							Math.floor(character_end_times_seconds[i] * FPS)
						);
						subtitlesData.push({
							startFrame,
							endFrame,
							text: currentWord.trim()
						});
						currentWord = '';
						wordStartIndex = i + 1;
					}
				} else {
					currentWord += characters[i];
				}
			}
			setSubtitles(subtitlesData);
			continueRender(handle);
		} catch (e) {
			console.error('Error in generateSubtitles:', e);
			cancelRender(e);
		}
	}, [titleEnd, handle, voiceoverFrames]);

	useEffect(() => {
		generateSubtitles();
	}, [generateSubtitles]);

	const titleEndFrame = Math.floor(FPS * titleEnd);

	return (
		<>
			<Audio src={voiceoverUrl} pauseWhenBuffering />
			<AbsoluteFill>
				<Series>
					{backgroundUrls.map((part, index) => (
						<Series.Sequence
							durationInFrames={videoConfig.durationInFrames / backgroundUrls.length}
							key={index}
						>
							<OffthreadVideo
								src={part}
								startFrom={0}
								endAt={videoConfig.durationInFrames / backgroundUrls.length}
								style={{
									position: 'absolute',
									width: '100%',
									height: '100%',
									objectFit: 'cover'
								}}
								muted
							/>
						</Series.Sequence>
					))}
				</Series>
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 100
					}}
				>
					{titleEndFrame > 0 && (
						<Sequence durationInFrames={titleEndFrame}>
							<AbsoluteFill
								style={{
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<RedditCard title={title} subreddit={subreddit} />
							</AbsoluteFill>
						</Sequence>
					)}
					{subtitles.map((subtitle, index) =>
						subtitle.startFrame < subtitle.endFrame ? (
							<Sequence
								from={subtitle.startFrame}
								durationInFrames={subtitle.endFrame - subtitle.startFrame}
								key={index}
							>
								<Subtitle text={subtitle.text} />
							</Sequence>
						) : null
					)}
				</AbsoluteFill>
			</AbsoluteFill>
		</>
	);
};
