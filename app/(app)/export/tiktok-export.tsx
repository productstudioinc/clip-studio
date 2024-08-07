import { TikTokAccount } from '@/actions/db/social-media-queries';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { State } from '@/utils/helpers/use-rendering';
import { useState } from 'react';

export function TikTokExportDialog({
	tiktokAccounts,
	disabled,
	state
}: {
	tiktokAccounts: TikTokAccount[];
	disabled: boolean;
	state: State;
}) {
	const [selectedAccount, setSelectedAccount] = useState<TikTokAccount | null>(null);
	const [caption, setCaption] = useState('');
	const [visibility, setVisibility] = useState('public');
	const [disableDuet, setDisableDuet] = useState(false);
	const [disableStitch, setDisableStitch] = useState(false);
	const [disableComments, setDisableComments] = useState(false);
	const [discloseVideoContent, setDiscloseVideoContent] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const handleupload = async () => {
		setIsUploading(true);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full" disabled={!disabled}>
					<TikTokIcon className="mr-2 h-4 w-4 dark:invert" />
					Export to TikTok
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>TikTok Upload</DialogTitle>
					<DialogDescription>
						Keep in mind the video must be under 60 seconds to be uploaded as a short
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col space-y-4">
					<Select
						onValueChange={(value) => {
							const account = tiktokAccounts.find((ch) => ch.id === value);
							setSelectedAccount(account || null);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a channel" />
						</SelectTrigger>
						<SelectContent>
							{tiktokAccounts.map((account) => (
								<SelectItem key={account.id} value={account.id}>
									{account.account_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{selectedAccount && (
						<>
							<div>
								<Label htmlFor="caption">Caption</Label>
								<Textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
							</div>
							<div>
								<Label htmlFor="visibility">Visibility</Label>
								<Select value={visibility} onValueChange={setVisibility}>
									<SelectTrigger>
										<SelectValue placeholder="Select visibility" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="public">Public</SelectItem>
										<SelectItem value="onlyyou">Only you</SelectItem>
										<SelectItem value="friends">Friends</SelectItem>
										<SelectItem value="followers">Followers</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center justify-between">
								<Label htmlFor="disable-duet">Disable Duet</Label>
								<Switch id="disable-duet" checked={disableDuet} onCheckedChange={setDisableDuet} />
							</div>
							<div className="flex items-center justify-between">
								<Label htmlFor="disable-stitch">Disable Stitch</Label>
								<Switch
									id="disable-stitch"
									checked={disableStitch}
									onCheckedChange={setDisableStitch}
								/>
							</div>
							<div className="flex items-center justify-between">
								<Label htmlFor="disable-comments">Disable Comments</Label>
								<Switch
									id="disable-comments"
									checked={disableComments}
									onCheckedChange={setDisableComments}
								/>
							</div>
							<div className="flex items-center justify-between">
								<Label htmlFor="disclose-video-content">Disclose Video Content</Label>
								<Switch
									id="disclose-video-content"
									checked={discloseVideoContent}
									onCheckedChange={setDiscloseVideoContent}
								/>
							</div>
							<Button
								onClick={() => handleupload()}
								disabled={isUploading || !selectedAccount || !caption}
							>
								Upload
							</Button>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

const TikTokIcon = ({ className }: { className?: string }) => {
	return (
		<svg
			fill="#000000"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
		</svg>
	);
};
