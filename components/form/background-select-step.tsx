'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SelectBackgroundWithParts } from '@/db/schema';
import { BackgroundTheme, VideoProps } from '@/stores/templatestore';
import type { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

type BackgroundSelectStepProps = {
	form: UseFormReturn<VideoProps>;
	backgrounds: SelectBackgroundWithParts[];
};

export const BackgroundSelectStep: FC<BackgroundSelectStepProps> = ({ form, backgrounds }) => {
	const handleSelect = (background: SelectBackgroundWithParts) => {
		form.setValue('backgroundTheme', background.name as BackgroundTheme);
		form.setValue(
			'backgroundUrls',
			background.backgroundParts.map((part) => part.partUrl)
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Choose a Background</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="w-full whitespace-nowrap pb-4">
					<FormField
						control={form.control}
						name="backgroundTheme"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<RadioGroup
										onValueChange={(value) => {
											field.onChange(value);
											const selectedBackground = backgrounds.find((bg) => bg.name === value);
											if (selectedBackground) {
												handleSelect(selectedBackground);
											}
										}}
										value={field.value}
										className="flex space-x-4"
									>
										{backgrounds.map((background) => (
											<div key={background.id} className="flex-shrink-0">
												<Label className="relative flex-shrink-0 hover:cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
													<RadioGroupItem value={background.name} className="sr-only" />
													<div className="w-[200px]">
														<video
															src={background.previewUrl}
															className="w-full h-[150px] object-cover rounded-md"
															autoPlay
															loop
															muted
														/>
														<div className="w-full p-2 text-center">{background.name}</div>
													</div>
												</Label>
											</div>
										))}
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</CardContent>
		</Card>
	);
};
