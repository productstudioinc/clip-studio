'use client';

import { getRedditInfo } from '@/actions/reddit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useServerAction } from 'zsa-react';

type RedditUrlStepProps = {
	form: UseFormReturn<any>;
};

export const RedditUrlStep: React.FC<RedditUrlStepProps> = ({ form }) => {
	const [postUrl, setPostUrl] = useState('');
	const [urlError, setUrlError] = useState<string | null>(null);
	const { execute, isPending } = useServerAction(getRedditInfo);

	const redditUrlSchema = z
		.string()
		.url()
		.refine((url) => url.includes('reddit.com/r/') && url.includes('/comments/'), {
			message: 'Invalid Reddit post URL'
		});

	const handleFetchRedditPost = async () => {
		try {
			redditUrlSchema.parse(postUrl);
			setUrlError(null);

			const [data, error] = await execute(postUrl);
			if (error) {
				toast.error(error.message);
			} else if (data) {
				form.setValue('subreddit', data.subreddit);
				form.setValue('title', data.title);
				form.setValue('text', data.text);
				toast.success('Reddit post data fetched successfully');
				setPostUrl('');
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				setUrlError(error.errors[0].message);
			} else {
				console.error('Error fetching Reddit post:', error);
				toast.error('Error fetching Reddit post');
			}
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Reddit Post URL</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="redditPostUrl">Enter Reddit Post URL</Label>
						<Input
							id="redditPostUrl"
							type="text"
							value={postUrl}
							onChange={(e) => {
								setPostUrl(e.target.value);
								setUrlError(null);
							}}
							placeholder="https://www.reddit.com/r/subreddit/comments/..."
							disabled={isPending}
						/>
						{urlError && <p className="text-sm text-red-500">{urlError}</p>}
					</div>
					<Button
						onClick={handleFetchRedditPost}
						className="w-full"
						disabled={isPending || !postUrl}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Fetching...
							</>
						) : (
							'Fetch Post Data'
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
