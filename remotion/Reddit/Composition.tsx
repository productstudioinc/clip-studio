import { useCallback, useEffect, useState } from 'react';
import {
	AbsoluteFill,
	Audio,
	cancelRender,
	continueRender,
	delayRender,
	OffthreadVideo,
	Sequence,
	Series
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
const BACKGROUND_VIDEO_DURATION = 60 * FPS;

export const RedditComposition = ({
	title,
	subreddit,
	voiceoverUrl,
	voiceoverFrames,
	accountName,
	titleEnd,
	backgroundUrls
}: z.infer<typeof RedditProps>) => {
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
						<Series.Sequence durationInFrames={BACKGROUND_VIDEO_DURATION} key={index}>
							<OffthreadVideo
								src={part}
								startFrom={0}
								endAt={BACKGROUND_VIDEO_DURATION}
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
								<RedditCard title={title} subreddit={subreddit} accountName={accountName} />
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
