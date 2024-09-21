'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

type TemplateSelectProps = {
	form: UseFormReturn<any>;
	templates: Array<{
		id: string | number; // Allow both string and number
		name: string;
		previewUrl: string;
		value: string;
	}>;
};

export const TemplateSelect: React.FC<TemplateSelectProps> = ({ form, templates }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Choose a Template</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="w-full whitespace-nowrap pb-4">
					<FormField
						control={form.control}
						name="template"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex space-x-4"
									>
										{templates.map((template) => (
											<Label
												key={template.id.toString()} // Convert id to string
												className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
											>
												<RadioGroupItem value={template.value} className="sr-only" />
												<video
													src={template.previewUrl}
													width={200}
													height={300}
													autoPlay
													loop
													playsInline
													muted
													className="w-[200px] h-[300px] object-cover rounded-t-md"
												/>
												<span className="w-full p-2 text-center">{template.name}</span>
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
