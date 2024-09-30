'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export function CreditCalculator() {
	const [minutes, setMinutes] = useState<number>(0);
	const maxMinutes = 120; // Approximately 1000 credits worth of minutes
	const minuteStep = 1;

	const credits = Math.round((minutes * 60) / 5);

	const formatDuration = (totalMinutes: number) => {
		const roundedMinutes = Math.round(totalMinutes);
		if (roundedMinutes > 60) {
			const hours = Math.floor(roundedMinutes / 60);
			const minutes = roundedMinutes % 60;
			return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
		} else {
			return `${roundedMinutes} minute${roundedMinutes !== 1 ? 's' : ''}`;
		}
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
						htmlFor="minute-slider"
						className="block text-sm font-medium text-muted-foreground"
					>
						Select video duration:
					</label>
					<Slider
						id="minute-slider"
						min={0}
						max={maxMinutes}
						step={minuteStep}
						value={[minutes]}
						onValueChange={(value) => setMinutes(value[0])}
						className="w-full"
					/>
					<div className="flex justify-between text-sm text-muted-foreground">
						{[0, 20, 40, 60, 80, 100, 120].map((value) => (
							<div key={value} className="flex flex-col items-center">
								<span className="mb-1">{value}m</span>
								<div className="h-1 w-0.5 bg-muted-foreground" />
							</div>
						))}
					</div>
				</div>
				<div className="text-center space-y-2">
					<p className="text-3xl font-bold text-primary">{credits} credits</p>
					<p className="text-lg">
						You can create ~<span className="font-semibold">{formatDuration(minutes)}</span> of
						video.
					</p>
				</div>
				<div className="bg-muted p-4 rounded-md">
					<h3 className="font-semibold mb-2">How it works:</h3>
					<ul className="list-disc list-inside space-y-1 text-sm">
						<li>Slide to select your desired video duration</li>
						<li>See instantly how many credits you&apos;ll need</li>
						<li>1 credit = 5 seconds of video</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
