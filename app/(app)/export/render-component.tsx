'use client';

import { YoutubeChannel } from '@/actions/db/social-media-queries';
import AnimatedCircularProgressBar from '@/components/magicui/animated-circular-progress-bar';
import { Separator } from '@/components/ui/separator';
import { useTemplateStore } from '@/stores/templatestore';
import { useRendering } from '@/utils/helpers/use-rendering';
import { ExportComponent } from './export-component';
import { RenderButton } from './render-button';
import { YoutubeExportDialog } from './youtube-export';

export function RenderControls({ youtubeChannels }: { youtubeChannels: YoutubeChannel[] }) {
	const { selectedTemplate, splitScreenState, redditState, twitterThreadState } = useTemplateStore(
		(state) => ({
			selectedTemplate: state.selectedTemplate,
			splitScreenState: state.splitScreenState,
			redditState: state.redditState,
			twitterThreadState: state.twitterThreadState
		})
	);

	const inputProps =
		selectedTemplate === 'SplitScreen'
			? splitScreenState
			: selectedTemplate === 'Reddit'
				? redditState
				: twitterThreadState;

	const { renderMedia, state, undo } = useRendering(selectedTemplate, inputProps);

	return (
		<div className="flex flex-row h-40">
			<AnimatedCircularProgressBar max={100} min={0} state={state} undo={undo} className="w-56">
				<RenderButton renderMedia={renderMedia} state={state} />
			</AnimatedCircularProgressBar>
			<Separator orientation="vertical" className="mx-4 h-full" />
			<div className="flex flex-col w-full">
				<ExportComponent state={state} undo={undo} />
				<div className="flex flex-col w-full">
					<Separator orientation="horizontal" className="mt-4 mb-4" />
					<div className="flex flex-col">
						<YoutubeExportDialog
							youtubeChannels={youtubeChannels}
							disabled={state.status === 'done'}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
