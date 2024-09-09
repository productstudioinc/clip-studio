'use client';

import { ElevenlabsVoice, generateAudioAndTimestamps } from '@/actions/elevenlabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTemplateStore } from '@/stores/templatestore';
import { Loader2, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useServerAction } from 'zsa-react';

export const SelectVoice: React.FC<{ voices: ElevenlabsVoice[] }> = ({ voices }) => {
	const {
		selectedTemplate,
		redditState,
		setRedditState,
		twitterThreadState,
		setTwitterThreadState
	} = useTemplateStore((state) => ({
		selectedTemplate: state.selectedTemplate,
		redditState: state.redditState,
		setRedditState: state.setRedditState,
		twitterThreadState: state.twitterThreadState,
		setTwitterThreadState: state.setTwitterThreadState
	}));

	const [playingAudio, setPlayingAudio] = useState<string | null>(null);
	const [selectedVoice, setSelectedVoice] = useState<ElevenlabsVoice | null>(
		voices.length > 0 ? voices[0] : null
	);

	const { isPending, execute } = useServerAction(generateAudioAndTimestamps);

	const handlePlayPause = (previewUrl: string | undefined, voiceId: string) => {
		if (!previewUrl) return;
		if (playingAudio === voiceId) {
			setPlayingAudio(null);
			const audio = document.getElementById(voiceId) as HTMLAudioElement;
			audio.pause();
		} else {
			if (playingAudio) {
				const currentAudio = document.getElementById(playingAudio) as HTMLAudioElement;
				currentAudio.pause();
			}
			setPlayingAudio(voiceId);
			const newAudio = document.getElementById(voiceId) as HTMLAudioElement;
			newAudio.volume = 0.4;
			newAudio.play();
		}
	};

	const handleSelectVoice = (voice: ElevenlabsVoice) => {
		setSelectedVoice(voice);
	};

	const handleGenerate = async () => {
		if (selectedVoice && selectedTemplate === 'Reddit') {
			const [data, err] = await execute({
				title: redditState.title,
				voiceId: selectedVoice.voice_id,
				text: redditState.text
			});
			if (err) {
				toast.error(err.message);
				return;
			}
			setRedditState({
				...redditState,
				durationInFrames: Math.floor(data.endTimestamp * 30),
				voiceoverUrl: data.signedUrl,
				voiceoverFrames: data.voiceoverObject
			});
		} else if (selectedTemplate === 'TwitterThread') {
			// Handle Twitter thread generation
		} else {
			toast.error('Voiceover generation not supported for this template.');
		}
	};

	return (
		<div className="space-y-4">
			<Card className="bg-secondary">
				<CardContent className="py-3 px-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
						<div>
							<h2 className="text-lg font-semibold">Selected Voice</h2>
							<p className="text-sm text-muted-foreground">
								{selectedVoice ? selectedVoice.name : 'No voice selected'}
							</p>
						</div>
						<Button
							onClick={handleGenerate}
							disabled={!selectedVoice || isPending}
							className="w-full sm:w-auto"
						>
							{isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
							Generate Voiceover
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{voices.map((voice) => (
					<Card
						key={voice.voice_id}
						className={`cursor-pointer transition-all hover:outline hover:outline-2 hover:outline-primary ${
							selectedVoice?.voice_id === voice.voice_id ? 'outline outline-2 outline-primary' : ''
						}`}
						onClick={() => handleSelectVoice(voice)}
					>
						<CardContent className="p-4 flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold truncate flex-1 mr-2">
									{voice.name || 'Unnamed Voice'}
								</h3>
								<Button
									size="sm"
									variant="outline"
									className="shrink-0"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handlePlayPause(voice.preview_url, voice.voice_id);
									}}
									aria-label={
										playingAudio === voice.voice_id ? 'Pause voice preview' : 'Play voice preview'
									}
								>
									{playingAudio === voice.voice_id ? (
										<Pause className="h-4 w-4" />
									) : (
										<Play className="h-4 w-4" />
									)}
								</Button>
							</div>
							{voice.labels && Object.keys(voice.labels).length > 0 && (
								<div className="flex flex-wrap gap-1">
									{Object.entries(voice.labels).map(([key, value]) => (
										<Badge key={key} variant="secondary" className="text-xs font-normal">
											{value}
										</Badge>
									))}
								</div>
							)}
							<audio id={voice.voice_id} src={voice.preview_url} />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};
