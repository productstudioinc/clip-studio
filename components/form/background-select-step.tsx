'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SelectBackgroundWithParts } from '@/db/schema';
import { VideoProps } from '@/stores/templatestore';
import type { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

type BackgroundSelectStepProps = {
	form: UseFormReturn<VideoProps>;
	backgrounds: SelectBackgroundWithParts[];
};

export const BackgroundSelectStep: FC<BackgroundSelectStepProps> = ({ form, backgrounds }) => {
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
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex space-x-4"
									>
										{backgrounds.map((background) => (
											<Label
												key={background.id}
												className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
											>
												<RadioGroupItem value={background.name} className="sr-only" />
												<video
													src={background.previewUrl}
													width={200}
													height={150}
													className="w-[200px] h-[150px] object-cover rounded-t-md"
													autoPlay
													loop
													muted
												/>
												<span className="w-full p-2 text-center">{background.name}</span>
											</Label>
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
