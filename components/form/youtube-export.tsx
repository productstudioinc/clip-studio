'use client';

import { YoutubeChannel } from '@/actions/db/social-media-queries';
import { createSocialMediaPost } from '@/actions/db/user-queries';
import { postVideoToYoutube } from '@/actions/youtube';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { State } from '@/utils/helpers/use-rendering';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function YoutubeExportDialog({
	youtubeChannels,
	disabled,
	state
}: {
	youtubeChannels: YoutubeChannel[];
	disabled?: boolean;
	state?: State;
}) {
	const [selectedChannel, setSelectedChannel] = useState<YoutubeChannel | null>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
	const [isUploading, setIsUploading] = useState(false);

	const handleUpload = async () => {
		setIsUploading(true);
		const [data, err] = await createSocialMediaPost();
		if (err) {
			toast.error(err.message);
		}
		if (data && selectedChannel) {
			await uploadPost(data);
		} else {
			toast.error('Please select a channel.');
		}
	};

	const uploadPost = async (socialMediaPostId: string) => {
		if (selectedChannel && state?.status === 'done') {
			const [data, err] = await postVideoToYoutube({
				title,
				description,
				youtubeChannelId: selectedChannel.id,
				parentSocialMediaPostId: socialMediaPostId,
				videoUrl: state?.url,
				visibility
			});
			if (err) {
				setIsUploading(false);
				toast.error(err.message);
			} else {
				setIsUploading(false);
				toast.success('Video uploaded to YouTube!');
			}
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-full text-md h-14 space-x-4" disabled={disabled}>
					<YoutubeIcon className="mr-2 h-8 w-8 invert dark:invert-0" />
					Export to Youtube
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Youtube Upload</DialogTitle>
					<DialogDescription>
						Keep in mind the video must be under 60 seconds to be uploaded as a short
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="channel" className="text-right">
							Channel
						</Label>
						<Select
							onValueChange={(value) => {
								const channel = youtubeChannels.find((ch) => ch.id === value);
								setSelectedChannel(channel || null);
							}}
						>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Select a channel" />
							</SelectTrigger>
							<SelectContent>
								{youtubeChannels.map((channel) => (
									<SelectItem key={channel.id} value={channel.id}>
										{channel.channelCustomUrl}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="title" className="text-right">
							Title
						</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="description" className="text-right">
							Description
						</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="visibility" className="text-right">
							Visibility
						</Label>
						<Select
							value={visibility}
							onValueChange={(value: 'public' | 'private' | 'unlisted') => setVisibility(value)}
						>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Select visibility" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="public">Public</SelectItem>
								<SelectItem value="private">Private</SelectItem>
								<SelectItem value="unlisted">Unlisted</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<div className="text-sm text-gray-500 mb-2">
						By posting, you agree to be bound by the{' '}
						<a
							href="https://www.youtube.com/t/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline"
						>
							YouTube Terms of Service
						</a>
					</div>
					<Button onClick={handleUpload} disabled={!selectedChannel || !title || isUploading}>
						{isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Upload
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

const YoutubeIcon: React.FC<{
	className?: string;
}> = ({ className }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className={className}>
			<path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
		</svg>
	);
};
