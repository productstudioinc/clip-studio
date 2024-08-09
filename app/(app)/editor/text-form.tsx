'use client';

import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import { ElevenlabsVoice } from '@/actions/elevenlabs';
import { TikTokExportDialog } from '@/app/(editor_old)/export/tiktok-export';
import { YoutubeExportDialog } from '@/app/(editor_old)/export/youtube-export';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
	text: z.string().min(1, 'Text is required'),
	voice: z.string().min(1, 'Please select a voice'),
	destination: z.string().min(1, 'Please select a destination')
});

type FormValues = z.infer<typeof formSchema>;

type TextFormProps = {
	youtubeChannels: YoutubeChannel[];
	tiktokAccounts: TikTokAccount[];
	voices: ElevenlabsVoice[];
};
export default function TextForm({ youtubeChannels, tiktokAccounts, voices }: TextFormProps) {
	const [playingAudio, setPlayingAudio] = useState<string | null>(null);
	const [selectedVoice, setSelectedVoice] = useState<ElevenlabsVoice | null>(
		voices.length > 0 ? voices[0] : null
	);
	const handlePlayPause = (previewUrl: string | undefined, voiceId: string) => {
		if (!previewUrl) return;
		const audio = document.getElementById(voiceId) as HTMLAudioElement;
		if (playingAudio === voiceId) {
			setPlayingAudio(null);
			audio.pause();
		} else {
			if (playingAudio) {
				const currentAudio = document.getElementById(playingAudio) as HTMLAudioElement;
				currentAudio.pause();
			}
			setPlayingAudio(voiceId);
			audio.currentTime = 0; // Reset audio to start
			audio.volume = 0.4;
			audio.play();
		}
	};

	const handleSelectVoice = (voice: ElevenlabsVoice) => {
		setSelectedVoice(voice);
	};

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: '',
			voice: undefined,
			destination: ''
		}
	});

	const onSubmit = (data: FormValues) => {
		console.log(data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="text"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Text</FormLabel>
							<FormControl>
								<Textarea placeholder="Enter your text here" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="voice"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Voice</FormLabel>
							<FormControl>
								<ScrollArea className="h-[300px] w-full rounded-md border">
									<div className="grid grid-cols-1 divide-y">
										{voices.map((voice) => (
											<div
												key={voice.voice_id}
												className={cn(
													`flex flex-row h-full cursor-pointer transition-all shadow-none rounded-none hover:bg-accent`,
													{
														'bg-muted': selectedVoice?.voice_id === voice.voice_id
													}
												)}
												onClick={() => handleSelectVoice(voice)}
											>
												<CardHeader className="p-4 justify-center items-center">
													<Button
														size="icon"
														onClick={(e: React.MouseEvent) => {
															e.stopPropagation();
															handlePlayPause(voice.preview_url, voice.voice_id);
														}}
													>
														{playingAudio === voice.voice_id ? (
															<Pause className="h-4 w-4" />
														) : (
															<Play className="h-4 w-4" />
														)}
													</Button>
												</CardHeader>
												<CardContent className="flex-grow flex flex-col gap-2 p-2">
													<CardTitle className="text-sm truncate">
														{voice.name || 'Unnamed Voice'}
													</CardTitle>
													{voice.labels && Object.keys(voice.labels).length > 0 && (
														<div className="flex flex-wrap gap-1">
															{Object.entries(voice.labels).map(([key, value]) => (
																<Badge
																	key={key}
																	variant="secondary"
																	className="text-[10px] font-normal"
																>
																	{value}
																</Badge>
															))}
														</div>
													)}
													<audio id={voice.voice_id} src={voice.preview_url} />
												</CardContent>
											</div>
										))}
									</div>
								</ScrollArea>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="destination"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Destination</FormLabel>
							<FormControl>
								<ToggleGroup type="single" onValueChange={field.onChange} value={field.value}>
									{youtubeChannels?.map((channel) => (
										<ToggleGroupItem key={channel.id} value={`youtube-${channel.id}`}>
											{channel.channelCustomUrl}
										</ToggleGroupItem>
									))}
									{tiktokAccounts?.map((account) => (
										<ToggleGroupItem key={account.id} value={`tiktok-${account.id}`}>
											{account.account_name}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
							</FormControl>
						</FormItem>
					)}
				/>
				<YoutubeExportDialog
					youtubeChannels={youtubeChannels}
					// disabled={state.status !== 'done'}
					// state={state}
				/>
				<TikTokExportDialog
					tiktokAccounts={tiktokAccounts}
					// disabled={state.status !== 'done'}
					// state={state}
				/>
			</form>
		</Form>
	);
}
