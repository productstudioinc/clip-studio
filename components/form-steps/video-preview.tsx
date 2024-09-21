'use client';

import { FormValues } from '@/components/forms/video-creator-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useTemplateConfig from '@/stores/templateConfig';
import { Player } from '@remotion/player';
import React from 'react';
import { UseFormWatch } from 'react-hook-form';

interface VideoPreviewProps {
	watch: UseFormWatch<FormValues>;
	selectedTemplate: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ watch, selectedTemplate }) => {
	const {
		component: CompositionComponent,
		state: inputProps,
		durationInFrames
	} = useTemplateConfig();

	const width = watch('width');
	const height = watch('height');
	const fps = watch('fps');
	const aspectRatioClass = React.useMemo(() => {
		const ratio = width / height;
		if (ratio === 9 / 16) {
			return 'max-w-[calc(100vh*9/16)] aspect-[9/16]';
		} else if (ratio === 16 / 9) {
			return 'max-w-[calc(100vh*16/9)] aspect-[16/9]';
		} else if (ratio === 1) {
			return 'max-w-[calc(100vh)] aspect-square';
		} else {
			return `aspect-[${width}/${height}]`;
		}
	}, [width, height]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Preview</CardTitle>
			</CardHeader>
			<CardContent>
				<div className={`w-full h-full flex items-center justify-center ${aspectRatioClass}`}>
					<Player
						component={CompositionComponent as any}
						className="rounded-md"
						style={{ width: '100%', height: '100%' }}
						inputProps={inputProps}
						durationInFrames={durationInFrames}
						fps={fps}
						compositionHeight={height}
						compositionWidth={width}
						controls
						autoPlay
						loop
						initiallyMuted
					/>
				</div>
				<div className="mt-4">
					<table className="w-full">
						<tbody>
							{selectedTemplate && (
								<tr>
									<td>
										<strong>Template:</strong>
									</td>
									<td>{selectedTemplate}</td>
								</tr>
							)}
							{watch('prompt') && (
								<tr>
									<td>
										<strong>Prompt:</strong>
									</td>
									<td>{watch('prompt')}</td>
								</tr>
							)}
							{watch('language') && (
								<tr>
									<td>
										<strong>Language:</strong>
									</td>
									<td>{watch('language')}</td>
								</tr>
							)}
							{watch('voice') && (
								<tr>
									<td>
										<strong>Voice:</strong>
									</td>
									<td>{watch('voice')}</td>
								</tr>
							)}
							<tr>
								<td>
									<strong>Voice Volume:</strong>
								</td>
								<td>{watch('voiceVolume')}%</td>
							</tr>
							{watch('music') && (
								<tr>
									<td>
										<strong>Music:</strong>
									</td>
									<td>{watch('music') === 'none' ? 'No background music' : watch('music')}</td>
								</tr>
							)}
							<tr>
								<td>
									<strong>Music Volume:</strong>
								</td>
								<td>{watch('musicVolume')}%</td>
							</tr>
							{watch('visualStyle') && (
								<tr>
									<td>
										<strong>Visual Style:</strong>
									</td>
									<td>{watch('visualStyle')}</td>
								</tr>
							)}
							<tr>
								<td>
									<strong>Aspect Ratio:</strong>
								</td>
								<td>{watch('aspectRatio')}</td>
							</tr>
							{watch('tweetId') && (
								<tr>
									<td>
										<strong>Tweet ID:</strong>
									</td>
									<td>{watch('tweetId')}</td>
								</tr>
							)}
							{watch('subreddit') && (
								<tr>
									<td>
										<strong>Subreddit:</strong>
									</td>
									<td>{watch('subreddit')}</td>
								</tr>
							)}
							{watch('title') && (
								<tr>
									<td>
										<strong>Title:</strong>
									</td>
									<td>{watch('title')}</td>
								</tr>
							)}
							{watch('text') && (
								<tr>
									<td>
										<strong>Text:</strong>
									</td>
									<td>{watch('text')}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
};
