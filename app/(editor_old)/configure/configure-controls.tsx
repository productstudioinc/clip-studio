'use client';

import { getVideoMetadata } from '@remotion/media-utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useServerAction } from 'zsa-react';

import { generatePresignedUrl } from '@/actions/generatePresignedUrl';
import { getRedditInfo } from '@/actions/reddit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTemplateStore } from '@/stores/templatestore';

export default function ConfigureControls() {
	const { selectedTemplate } = useTemplateStore((state) => ({
		selectedTemplate: state.selectedTemplate
	}));

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-semibold leading-none tracking-tight">Modify Template</h2>
			{selectedTemplate === 'SplitScreen' && <SplitScreenControls />}
			{selectedTemplate === 'Reddit' && <RedditControls />}
			{selectedTemplate === 'TwitterThread' && <TwitterThreadControls />}
		</div>
	);
}

const SplitScreenControls: React.FC = () => {
	const { splitScreenState, setSplitScreenState } = useTemplateStore((state) => ({
		splitScreenState: state.splitScreenState,
		setSplitScreenState: state.setSplitScreenState
	}));

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files === null) return;

		const file = event.target.files[0];
		const MAX_FILE_SIZE = 200 * 1024 * 1024;

		if (file.size > MAX_FILE_SIZE) {
			toast.error('File size exceeds 200MB');
			return;
		}

		const blobUrl = URL.createObjectURL(file);
		const contentType = file.type || 'application/octet-stream';
		const arrayBuffer = await file.arrayBuffer();
		const contentLength = arrayBuffer.byteLength;

		const [data, err] = await generatePresignedUrl({ contentType, contentLength });

		if (err) {
			toast.error(err.message);
		} else {
			setSplitScreenState({ ...splitScreenState, type: 'blob', videoUrl: blobUrl });

			await fetch(data?.presignedUrl, {
				method: 'PUT',
				body: arrayBuffer,
				headers: { 'Content-Type': contentType }
			});

			const { durationInSeconds } = await getVideoMetadata(data?.readUrl);

			setSplitScreenState({
				...splitScreenState,
				type: 'cloud',
				videoUrl: data?.readUrl,
				durationInFrames: Math.floor(durationInSeconds * 30),
				transcriptionId: '',
				transcription: { text: '', chunks: [] }
			});

			URL.revokeObjectURL(blobUrl);
		}
	};

	return (
		<div className="space-y-2">
			<Label htmlFor="video">Your Video (Max 200MB)</Label>
			<Input id="video" type="file" accept="video/*" onChange={handleFileChange} />
		</div>
	);
};

const RedditControls: React.FC = () => {
	const { redditState, setRedditState } = useTemplateStore((state) => ({
		redditState: state.redditState,
		setRedditState: state.setRedditState
	}));
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
				setRedditState({
					...redditState,
					subreddit: data.subreddit,
					title: data.title,
					text: data.text
				});
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
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="redditPostUrl">Reddit Post URL</Label>
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
				<Button onClick={handleFetchRedditPost} className="w-full" disabled={isPending || !postUrl}>
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
			<div className="space-y-2">
				<Label htmlFor="redditAccount">Account Name</Label>
				<Input
					id="redditAccount"
					type="text"
					value={redditState.accountName}
					onChange={(e) => setRedditState({ ...redditState, accountName: e.target.value })}
					disabled={isPending}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="redditSubreddit">Subreddit</Label>
				<Input
					id="redditSubreddit"
					type="text"
					value={redditState.subreddit}
					onChange={(e) => setRedditState({ ...redditState, subreddit: e.target.value })}
					disabled={isPending}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="redditTitle">Title</Label>
				<Textarea
					id="redditTitle"
					value={redditState.title}
					onChange={(e) => setRedditState({ ...redditState, title: e.target.value })}
					disabled={isPending}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="redditText">Text</Label>
				<Textarea
					id="redditText"
					value={redditState.text}
					onChange={(e) => setRedditState({ ...redditState, text: e.target.value })}
					disabled={isPending}
				/>
			</div>
		</div>
	);
};

const TwitterThreadControls: React.FC = () => {
	const { twitterThreadState, setTwitterThreadState } = useTemplateStore((state) => ({
		twitterThreadState: state.twitterThreadState,
		setTwitterThreadState: state.setTwitterThreadState
	}));

	const handleTweetIdsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const input = event.target.value;
		const tweetUrls = input.split(/[\n,]+/).map((url) => url.trim());
		const tweetIds = new Set(
			tweetUrls
				.map((url) => {
					const match = url.match(/\/status\/(\d+)/);
					return match ? match[1] : null;
				})
				.filter((id) => id !== null) as string[]
		);
		setTwitterThreadState({ tweetIds: Array.from(tweetIds) });
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="tweetUrls">Tweet URLs</Label>
				<Textarea
					id="tweetUrls"
					onChange={handleTweetIdsChange}
					placeholder="Enter tweet URLs, one per line"
				/>
			</div>
			{twitterThreadState.tweetIds.length > 0 && (
				<div className="space-y-2">
					<Label>Extracted Tweet IDs</Label>
					<div className="bg-muted p-2 rounded-md">
						{twitterThreadState.tweetIds.map((tweetId) => (
							<div key={tweetId} className="text-sm">
								{tweetId}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
