'use client';
import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTemplateStore } from '@/stores/templatestore';
import { State, useRendering } from '@/utils/helpers/use-rendering';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { TikTokExportDialog } from './tiktok-export';
import { YoutubeExportDialog } from './youtube-export';

interface RenderState {
	status: 'init' | 'invoking' | 'rendering' | 'done' | 'error';
	error?: { message: string };
}

export const RenderButton: React.FC<{
	renderMedia: () => void;
	state: RenderState;
}> = ({ renderMedia, state }) => {
	useEffect(() => {
		if (state.status === 'error') {
			toast.error(state.error?.message);
		}
		if (state.status === 'done') {
			toast.success('Render completed!');
		}
	}, [state]);
	const isLoading = state.status === 'invoking' || state.status === 'rendering';

	return (
		<Button
			variant={'rainbow-outline'}
			disabled={isLoading || state.status === 'done'}
			onClick={renderMedia}
			className="w-full h-12 text-md"
		>
			{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			Generate Video with AI
		</Button>
	);
};

const Megabytes: React.FC<{
	sizeInBytes: number;
	className?: string;
}> = ({ sizeInBytes, className }) => {
	const megabytes = Intl.NumberFormat('en', {
		notation: 'compact',
		style: 'unit',
		unit: 'byte',
		unitDisplay: 'narrow'
	}).format(sizeInBytes);
	return <span className={cn('opacity-60', className)}>({megabytes})</span>;
};

export const ExportComponent: React.FC<{
	state: State;
	undo: () => void;
}> = ({ state, undo }) => {
	const isDownloadReady = state.status === 'done';

	return (
		<div className="w-full">
			{isDownloadReady ? (
				<a href={state.url}>
					<Button className="w-full h-12 text-md">
						Download
						<Megabytes sizeInBytes={state.size} className="ml-1" />
					</Button>
				</a>
			) : (
				<Button disabled className="w-full h-12 text-md">
					Download
				</Button>
			)}
		</div>
	);
};

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

	const isRenderingComplete = state.status === 'done';

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Render Controls</CardTitle>
			</CardHeader>
			<CardContent>
				<RenderButton renderMedia={renderMedia} state={state} />
				<div className="flex flex-col space-y-4">
					{state.status === 'rendering' && (
						<div className="space-y-2">
							<Progress value={state.progress * 100} />
							<p className="text-sm text-center text-muted-foreground">
								Rendering: {Math.round(state.progress * 100)}%
							</p>
						</div>
					)}
					<Separator />
					<ExportComponent state={state} undo={undo} />
					<Separator />
					<div className="flex space-x-4">
						<YoutubeExportDialog
							youtubeChannels={youtubeChannels}
							disabled={!isRenderingComplete}
							state={state}
						/>
						<TikTokExportDialog
							tiktokAccounts={tiktokAccounts}
							disabled={!isRenderingComplete}
							state={state}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
