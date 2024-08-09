'use client';

import { ElevenlabsVoice, generateAudioAndTimestamps } from '@/actions/elevenlabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemplateStore } from '@/stores/templatestore';
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useServerAction } from 'zsa-react';

export const SelectVoice: React.FC<{
	voices: ElevenlabsVoice[];
}> = ({ voices }) => {
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
		} else {
			toast.error('Voiceover generation not supported for this template.');
		}
		// need to handle twitter thread too
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between bg-secondary p-4 rounded-lg">
				<p className="text-lg font-semibold">
					{selectedVoice ? `Selected Voice: ${selectedVoice.name}` : 'No voice selected'}
				</p>
				<Button onClick={handleGenerate} disabled={!selectedVoice || isPending}>
					Generate
				</Button>
			</div>
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
				{voices.map((voice) => (
					<Card
						key={voice.voice_id}
						className={`flex flex-row h-full cursor-pointer transition-all ${
							selectedVoice?.voice_id === voice.voice_id ? 'ring-2 ring-primary' : ''
						}`}
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
							<CardTitle className="text-sm truncate">{voice.name || 'Unnamed Voice'}</CardTitle>
							{voice.labels && Object.keys(voice.labels).length > 0 && (
								<div className="flex flex-wrap gap-1">
									{Object.entries(voice.labels).map(([key, value]) => (
										<Badge key={key} variant="secondary" className="text-[10px] font-normal">
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
