'use client';

import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import { TikTokExportDialog } from '@/app/(editor_old)/export/tiktok-export';
import { YoutubeExportDialog } from '@/app/(editor_old)/export/youtube-export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTemplateStore, VideoProps } from '@/stores/templatestore';
import { State, useRendering } from '@/utils/helpers/use-rendering';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

interface RenderState {
	status: 'init' | 'invoking' | 'rendering' | 'done' | 'error';
	error?: { message: string };
}

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

type FormSubmitProps = {
	form: UseFormReturn<VideoProps>;
	youtubeChannels: YoutubeChannel[];
	tiktokAccounts: TikTokAccount[];
};

export function FormSubmit({ youtubeChannels, tiktokAccounts, form }: FormSubmitProps) {
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
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Generate Video</CardTitle>
			</CardHeader>
			<CardContent>
				<Button
					variant={'rainbow'}
					disabled={
						isLoading ||
						state.status === 'done' ||
						form.formState.isSubmitting ||
						!form.formState.isValid
					}
					onClick={renderMedia}
					size="lg"
					className="w-full text-lg h-14"
				>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Generate Video
				</Button>
				<div className="flex flex-col space-y-4">
					{state.status === 'rendering' && (
						<div className="space-y-2 pt-4">
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
