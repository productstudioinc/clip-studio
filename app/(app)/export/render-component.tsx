'use client';

import AnimatedCircularProgressBar from '@/components/magicui/animated-circular-progress-bar';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTemplateStore } from '@/stores/templatestore';
import { YoutubeChannel } from '@/utils/actions/socialMediaAccounts';
import { useRendering } from '@/utils/helpers/use-rendering';
import { useState } from 'react';
import { ExportComponent } from './export-component';
import { RenderButton } from './render-button';

export function RenderControls({ youtubeChannels }: { youtubeChannels: YoutubeChannel[] }) {
	const { selectedTemplate, splitScreenState, redditState, twitterThreadState } = useTemplateStore(
		(state) => ({
			selectedTemplate: state.selectedTemplate,
			splitScreenState: state.splitScreenState,
			redditState: state.redditState,
			twitterThreadState: state.twitterThreadState
		})
	);

	const [selectedChannel, setSelectedChannel] = useState<YoutubeChannel | null>(null);
	const [title, setTitle] = useState('');

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
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" className="w-full" disabled={state.status === 'done'}>
									<YoutubeIcon className="mr-2 h-4 w-4 dark:invert" />
									Export to Youtube
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Youtube Upload</DialogTitle>
									<DialogDescription></DialogDescription>
								</DialogHeader>
								<div className="flex flex-col">
									<Select
										onValueChange={(value) => {
											const channel = youtubeChannels.find((ch) => ch.id === value);
											setSelectedChannel(channel || null);
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a channel" />
										</SelectTrigger>
										<SelectContent>
											{youtubeChannels.map((channel) => (
												<SelectItem key={channel.id} value={channel.id}>
													{channel.channelCustomUrl}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								{selectedChannel && (
									<div>
										<Input
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											placeholder="Title"
										/>
									</div>
								)}
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</div>
		</div>
	);
}

const YoutubeIcon: React.FC<{
	className?: string;
}> = ({ className }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className={className}>
			<path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
		</svg>
	);
};
