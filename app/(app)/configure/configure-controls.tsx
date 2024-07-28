'use client';

import { generatePresignedUrl } from '@/actions/generatePresignedUrl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTemplateStore } from '@/stores/templatestore';
import { getVideoMetadata } from '@remotion/media-utils';
import { toast } from 'sonner';

export default function ConfigureControls() {
	const { selectedTemplate } = useTemplateStore((state) => ({
		selectedTemplate: state.selectedTemplate
	}));
	return (
		<>
			<h2 className="text-2xl font-semibold leading-none tracking-tight pt-2 pb-6">
				Modify Template
			</h2>
			{selectedTemplate === 'SplitScreen' && <SplitScreenControls />}
			{selectedTemplate === 'Reddit' && <RedditControls />}
			{selectedTemplate === 'TwitterThread' && <TwitterThreadControls />}
			<div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4"></div>
		</>
	);
}

const SplitScreenControls: React.FC = ({}) => {
	const { splitScreenState, setSplitScreenState } = useTemplateStore((state) => ({
		splitScreenState: state.splitScreenState,
		setSplitScreenState: state.setSplitScreenState
	}));

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files === null) {
			return;
		}

		const file = event.target.files[0];

		const MAX_FILE_SIZE = 200 * 1024 * 1024;
		if (file.size > MAX_FILE_SIZE) {
			toast.error('File size exceeds 200mb');
			return;
		}

		const blobUrl = URL.createObjectURL(file);

		const contentType = file.type || 'application/octet-stream';
		const arrayBuffer = await file.arrayBuffer();
		const contentLength = arrayBuffer.byteLength;

		const [data, err] = await generatePresignedUrl({
			contentType: contentType,
			contentLength: contentLength
		});
		if (err) {
			toast.error(err.message);
		} else {
			setSplitScreenState({
				...splitScreenState,
				type: 'blob',
				videoUrl: blobUrl
			});

			await fetch(data?.presignedUrl, {
				method: 'PUT',
				body: arrayBuffer,
				headers: {
					'Content-Type': contentType
				}
			});

			const { durationInSeconds } = await getVideoMetadata(data?.readUrl);

			setSplitScreenState({
				...splitScreenState,
				type: 'cloud',
				videoUrl: data?.readUrl,
				durationInFrames: Math.floor(durationInSeconds * 30),
				transcriptionId: '',
				transcription: {
					text: '',
					chunks: []
				}
			});

			URL.revokeObjectURL(blobUrl);
		}
	};

	return (
		<div className="grid w-full max-w-sm items-center gap-1.5 pb-4">
			<Label htmlFor="video">Your Video</Label>
			<p className="text-sm text-muted-foreground">Max 200mb</p>
			<Input id="video" type="file" accept="video/*" onChange={handleFileChange} />
		</div>
	);
};

const RedditControls: React.FC = ({}) => {
	const { redditState, setRedditState } = useTemplateStore((state) => ({
		redditState: state.redditState,
		setRedditState: state.setRedditState
	}));
	return (
		<>
			<div className="grid w-full max-w-sm items-center gap-1.5 pb-4">
				<Label htmlFor="redditTitle">Title</Label>
				<Textarea id="redditTitle" />
			</div>
			<div className="grid w-full max-w-sm items-center gap-1.5 pb-4">
				<Label htmlFor="redditText">Text</Label>
				<Textarea id="redditText" />
			</div>
		</>
	);
};

const TwitterThreadControls: React.FC = ({}) => {
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
		<div className="grid w-full max-w-sm items-center gap-1.5 pb-4">
			<Label htmlFor="tweetUrls">Tweet URLs</Label>
			{twitterThreadState.tweetIds.map((tweetId) => (
				<div key={tweetId}>{tweetId}</div>
			))}
			<Textarea id="tweetUrls" onChange={handleTweetIdsChange} />
		</div>
	);
};
