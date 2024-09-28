'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AspectRatio, AspectRatioMap, VideoProps } from '@/stores/templatestore';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

type AspectRatioStepProps = {
	form: UseFormReturn<VideoProps>;
};

export const AspectRatioStep: React.FC<AspectRatioStepProps> = ({ form }) => {
	const aspectRatios = Object.entries(AspectRatioMap).map(([key, value]) => ({
		value: key,
		label: key,
		...value
	}));

	const onAspectRatioChange = (aspectRatio: AspectRatio) => {
		const { width, height } = AspectRatioMap[aspectRatio];
		form.setValue('width', width);
		form.setValue('height', height);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Select Aspect Ratio</CardTitle>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name="aspectRatio"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<RadioGroup
									onValueChange={(value) => {
										field.onChange(value);
										onAspectRatioChange(value as AspectRatio);
									}}
									defaultValue={field.value}
									className="grid grid-cols-3 gap-4"
								>
									{aspectRatios.map((ratio) => (
										<Label
											key={ratio.value}
											className="flex flex-col items-center space-y-2 rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary justify-between cursor-pointer"
										>
											<RadioGroupItem value={ratio.value} id={ratio.value} className="sr-only" />
											<div
												className={`border-2 border-current rounded-lg flex items-center justify-center ${
													ratio.value === AspectRatio.Vertical
														? 'h-16 w-9'
														: ratio.value === AspectRatio.Horizontal
															? 'h-9 w-16'
															: 'h-12 w-12'
												}`}
											>
												{ratio.name}
											</div>
											<div className="text-center">
												<div className="font-semibold">{ratio.name}</div>
												<div className="text-sm text-muted-foreground">{ratio.description}</div>
											</div>
										</Label>
									))}
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
};
