'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type TwitterUrlStepProps = {
	form: UseFormReturn<any>;
};

export const TwitterUrlStep: React.FC<TwitterUrlStepProps> = ({ form }) => {
	const [tweetUrl, setTweetUrl] = useState('');
	const [urlError, setUrlError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const twitterUrlSchema = z
		.string()
		.url()
		.refine(
			(url) =>
				(url.includes('twitter.com') && url.includes('/status/')) ||
				(url.includes('x.com') && url.includes('/status/')),
			{
				message: 'Invalid Twitter tweet URL'
			}
		);

	const handleExtractTweetId = async () => {
		try {
			setIsPending(true);
			twitterUrlSchema.parse(tweetUrl);
			setUrlError(null);

			const tweetId = tweetUrl.match(/\/status\/(\d+)/)?.[1];
			if (!tweetId) {
				throw new Error('Could not extract tweet ID from URL');
			}

			form.setValue('tweetId', [tweetId]);
			toast.success('Tweet ID extracted successfully');
			setTweetUrl('');
		} catch (error) {
			if (error instanceof z.ZodError) {
				setUrlError(error.errors[0].message);
			} else {
				console.error('Error extracting tweet ID:', error);
				toast.error('Error extracting tweet ID');
			}
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Twitter Tweet URL</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="twitterTweetUrl">Enter Tweet URL</Label>
						<Input
							id="twitterTweetUrl"
							type="text"
							value={tweetUrl}
							onChange={(e) => {
								setTweetUrl(e.target.value);
								setUrlError(null);
							}}
							placeholder="https://twitter.com/username/status/..."
							disabled={isPending}
						/>
						{urlError && <p className="text-sm text-red-500">{urlError}</p>}
					</div>
					<Button
						onClick={handleExtractTweetId}
						className="w-full"
						disabled={isPending || !tweetUrl}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Extracting...
							</>
						) : (
							'Extract Tweet ID'
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
