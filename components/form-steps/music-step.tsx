'use client';

import { musicOptions } from '@/components/forms/video-creator-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

type MusicStepProps = {
	form: UseFormReturn<any>;
};

export const MusicStep: React.FC<MusicStepProps> = ({ form }) => {
	const [playing, setPlaying] = useState<string | null>(null);
	const [progress, setProgress] = useState<Record<string, number>>({});
	const progressInterval = useRef<NodeJS.Timeout | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handleAudioPlay = useCallback(
		(id: string, duration: number) => {
			if (playing === id) {
				audioRef.current?.pause();
				setPlaying(null);
				clearInterval(progressInterval.current!);
			} else {
				audioRef.current?.pause();
				clearInterval(progressInterval.current!);

				setPlaying(id);
				setProgress((prev) => ({ ...prev, [id]: 0 }));
				const audio = new Audio(musicOptions.find((m) => m.id === id)?.audio || '');
				audio.volume = 0.4;
				audioRef.current = audio;

				audio.play().catch((error) => {
					console.error('Could not play audio:', error);
					setPlaying(null);
				});

				progressInterval.current = setInterval(() => {
					setProgress((prev) => ({
						...prev,
						[id]: (audio.currentTime / duration) * 100
					}));

					if (audio.currentTime >= duration) {
						clearInterval(progressInterval.current!);
						setPlaying(null);
						setProgress((prev) => ({ ...prev, [id]: 0 }));
					}
				}, 50);
			}
		},
		[playing]
	);

	useEffect(() => {
		return () => {
			audioRef.current?.pause();
			clearInterval(progressInterval.current!);
		};
	}, []);

	const formatTime = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Choose Background Music</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px] p-4 mt-4 border rounded-md">
					<FormField
						control={form.control}
						name="music"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="space-y-1"
									>
										{musicOptions.map((music) => (
											<Label
												key={music.id}
												htmlFor={music.id}
												className="flex items-center gap-4 cursor-pointer relative rounded-md border p-2 [&:has([data-state=checked])]:border-primary overflow-hidden"
											>
												<RadioGroupItem value={music.id} id={music.id} className="sr-only" />
												<div className="absolute inset-0 w-full h-full bg-secondary/40 pointer-events-none">
													<div
														className="h-full bg-secondary transition-all duration-100 ease-in-out"
														style={{
															width: `${playing === music.id ? progress[music.id] || 0 : 0}%`
														}}
													/>
												</div>
												<div className="flex-shrink-0 relative z-10">
													{music.audio ? (
														<Button
															type="button"
															variant="outline"
															className="rounded-full"
															size="icon"
															onClick={() => handleAudioPlay(music.id, music.duration)}
														>
															{playing === music.id ? (
																<Pause className="h-4 w-4" />
															) : (
																<Play className="h-4 w-4" />
															)}
															<span className="sr-only">
																{playing === music.id ? 'Pause' : 'Play'} {music.name}
															</span>
														</Button>
													) : (
														<VolumeX className="h-6 w-6 text-muted-foreground" />
													)}
												</div>
												<div className="flex-grow relative z-10">
													<span className="font-semibold">{music.name}</span>
													<span className="text-sm text-muted-foreground block">
														{music.description}
													</span>
												</div>
												<div className="flex flex-col items-end relative z-10">
													<span className="text-sm text-muted-foreground">
														{playing === music.id
															? `${formatTime(Math.floor((progress[music.id] * music.duration) / 100))} / ${formatTime(music.duration)}`
															: formatTime(music.duration)}
													</span>
												</div>
												{music.audio && <audio id={`audio-${music.id}`} src={music.audio} />}
											</Label>
										))}
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</ScrollArea>
				<div className="space-y-2 mt-4">
					<FormField
						control={form.control}
						name="musicVolume"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Music Volume</FormLabel>
								<FormControl>
									<Slider
										value={[field.value]}
										onValueChange={(value) => field.onChange(value[0])}
										max={100}
										step={1}
										disabled={form.watch('music') === 'none'}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
};
