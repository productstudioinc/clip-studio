'use client';
import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import AnimatedCircularProgressBar from '@/components/magicui/animated-circular-progress-bar';
import { Separator } from '@/components/ui/separator';
import { useTemplateStore } from '@/stores/templatestore';
import { useRendering } from '@/utils/helpers/use-rendering';
import { ExportComponent } from './export-component';
import { RenderButton } from './render-button';
import { TikTokExportDialog } from './tiktok-export';
import { YoutubeExportDialog } from './youtube-export';

export function RenderControls({
	youtubeChannels,
	tiktokAccounts
}: {
	youtubeChannels: YoutubeChannel[];
	tiktokAccounts: TikTokAccount[];
}) {
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
		<div className="flex flex-col xl:flex-row xl:h-40">
			<div className="flex justify-center xl:justify-start mb-4 xl:mb-0">
				<AnimatedCircularProgressBar max={100} min={0} state={state} undo={undo}>
					<RenderButton renderMedia={renderMedia} state={state} />
				</AnimatedCircularProgressBar>
			</div>

			<Separator orientation="horizontal" className="my-4 xl:hidden" />
			<Separator orientation="vertical" className="mx-4 h-full hidden xl:block" />

			<div className="flex flex-col w-full">
				<ExportComponent state={state} undo={undo} />
				<div className="flex flex-col w-full">
					<Separator orientation="horizontal" className="mt-4 mb-4" />
					<div className="flex flex-col gap-4">
						<YoutubeExportDialog
							youtubeChannels={youtubeChannels}
							disabled={state.status !== 'done'}
							state={state}
						/>
						<TikTokExportDialog
							tiktokAccounts={tiktokAccounts}
							disabled={state.status !== 'done'}
							state={state}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
