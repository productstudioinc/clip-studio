'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { VideoProps } from '@/stores/templatestore';
import Image from 'next/image';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

type VisualStyleStepProps = {
	form: UseFormReturn<VideoProps>;
};

const visualStyles = [
	{ id: 'style1', name: 'Style 1', image: '/placeholder.svg' },
	{ id: 'style2', name: 'Style 2', image: '/placeholder.svg' },
	{ id: 'style3', name: 'Style 3', image: '/placeholder.svg' },
	{ id: 'style4', name: 'Style 4', image: '/placeholder.svg' },
	{ id: 'style5', name: 'Style 5', image: '/placeholder.svg' }
];

export const VisualStyleStep: React.FC<VisualStyleStepProps> = ({ form }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Choose a Visual Style</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="w-full whitespace-nowrap pb-4">
					<FormField
						control={form.control}
						name="visualStyle"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex space-x-4"
									>
										{visualStyles.map((style) => (
											<Label
												key={style.id}
												className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
											>
												<RadioGroupItem value={style.id} className="sr-only" />
												<Image
													src={style.image}
													alt={style.name}
													width={200}
													height={150}
													className="w-[200px] h-[150px] object-cover rounded-t-md"
												/>
												<span className="w-full p-2 text-center">{style.name}</span>
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
