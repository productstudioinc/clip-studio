'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export function CreditCalculator() {
	const [credits, setCredits] = useState<number>(500);
	const maxCredits = 2000;
	const creditStep = 50;
	const videoSeconds = credits * 5;
	const voiceoverCharacters = credits * 100;
	const transcriptionSeconds = credits * 10;

	const formatDuration = (totalSeconds: number) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.ceil((totalSeconds % 3600) / 60);

		if (hours > 0) {
			return `${formatNumber(hours)}h ${formatNumber(minutes)}m`;
		} else {
			return `${formatNumber(minutes)}m`;
		}
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat(navigator.language).format(num);
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl font-bold text-center">
					Credit Conversion Calculator
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<label
						htmlFor="credit-slider"
						className="block text-sm font-medium text-muted-foreground"
					>
						Select number of credits:
					</label>
					<Slider
						id="credit-slider"
						min={0}
						max={maxCredits}
						step={creditStep}
						value={[credits]}
						onValueChange={(value) => setCredits(value[0])}
						className="w-full"
					/>
					<div className="flex justify-between text-sm text-muted-foreground">
						{[0, 500, 1000, 1500, 2000].map((value) => (
							<div key={value} className="flex flex-col items-center">
								<span className="mb-1">{value}</span>
								<div className="h-1 w-0.5 bg-muted-foreground" />
							</div>
						))}
					</div>
				</div>
				<div className="text-center space-y-2">
					<p className="text-3xl font-bold text-primary">
						{formatNumber(credits)}
						<span className="ml-2 text-2xl">credits</span>
					</p>
					<p className="text-sm text-muted-foreground">Approximately equivalent to:</p>
				</div>
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium">Video:</span>
						<span className="font-semibold">{formatDuration(videoSeconds)}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium">Voiceover:</span>
						<span className="font-semibold">
							{formatNumber(voiceoverCharacters)}
							<span className="ml-1">characters</span>
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium">Transcription:</span>
						<span className="font-semibold">{formatDuration(transcriptionSeconds)}</span>
					</div>
				</div>
				<div className="bg-muted p-4 rounded-md">
					<h3 className="font-semibold mb-2">How it works:</h3>
					<ul className="list-disc list-inside space-y-1 text-sm">
						<li>Slide to select the number of credits</li>
						<li>See instantly what you can create</li>
						<li>1 credit = 5 seconds of video</li>
						<li>1 credit = 100 characters of voiceover</li>
						<li>1 credit = 10 seconds of transcription</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
