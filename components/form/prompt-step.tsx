'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

type PromptStepProps = {
	form: UseFormReturn<any>;
};

export const PromptStep: React.FC<PromptStepProps> = ({ form }) => {
	const generateScript = useCallback(() => {
		const prompt = form.getValues('prompt');
		console.log('Generating script from prompt:', prompt);
		toast.info('Generating script', {
			description: 'AI is working on your script based on the provided prompt.'
		});
	}, [form]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Write Your Prompt</CardTitle>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name="prompt"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Enter your video prompt here..."
									{...field}
									rows={5}
									className="w-full"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="button" onClick={generateScript} className="w-full mt-4">
					<Wand2 className="mr-2 h-4 w-4" /> Generate Script
				</Button>
			</CardContent>
		</Card>
	);
};
