import { TikTokAccount } from '@/actions/db/social-media-queries';
import { createSocialMediaPost } from '@/actions/db/user-queries';
import { uploadTiktokPost } from '@/actions/tiktok';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { State } from '@/utils/helpers/use-rendering';
import { InfoIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function TikTokExportDialog({
	tiktokAccounts,
	disabled,
	state
}: {
	tiktokAccounts: TikTokAccount[];
	disabled?: boolean;
	state?: State;
}) {
	const [selectedAccount, setSelectedAccount] = useState<TikTokAccount | null>(null);
	const [caption, setCaption] = useState('');
	const [visibility, setVisibility] = useState<
		'PUBLIC_TO_EVERYONE' | 'SELF_ONLY' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR'
	>('PUBLIC_TO_EVERYONE');
	const [disableDuet, setDisableDuet] = useState(false);
	const [disableStitch, setDisableStitch] = useState(false);
	const [disableComments, setDisableComments] = useState(false);
	const [discloseVideoContent, setDiscloseVideoContent] = useState(false);
	const [videoContentType, setVideoContentType] = useState<
		'yourBrand' | 'brandedContent' | undefined
	>(undefined);
	const [isUploading, setIsUploading] = useState(false);

	const handleupload = async () => {
		setIsUploading(true);
		const [data, err] = await createSocialMediaPost();
		if (err) {
			toast.error(err.message);
		}
		if (data && selectedAccount) {
			await uploadPost(data);
		}
	};

	const uploadPost = async (socialMediaPostId: string) => {
		if (selectedAccount && state?.status === 'done') {
			try {
				await toast.promise(
					async () => {
						const [data, error] = await uploadTiktokPost({
							accessToken: selectedAccount.accessToken,
							caption,
							videoUrl: state?.url,
							parentSocialMediaPostId: socialMediaPostId,
							tiktokAccountId: selectedAccount.id,
							privacyLevel: visibility,
							disableComments,
							disableDuet,
							disableStitch,
							discloseVideoContent,
							videoContentType
						});
						if (error) throw error;
						return data;
					},
					{
						loading: 'Uploading video to TikTok, please keep this window open...',
						success: 'Video uploaded to TikTok!',
						error: (err) => `Upload failed: ${err.message}`
					}
				);
			} catch (error) {
				console.error('Error uploading to TikTok:', error);
			} finally {
				setIsUploading(false);
			}
		} else {
			setIsUploading(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full h-14 space-x-4 text-md disabled:opacity-90"
					disabled={disabled}
				>
					<TikTokIcon className="mr-2 h-8 w-8 dark:invert" />
					Export to TikTok
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>TikTok Upload</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="account" className="text-right">
							Account
						</Label>
						<Select
							onValueChange={(value) => {
								const account = tiktokAccounts.find((ch) => ch.id === value);
								setSelectedAccount(account || null);
							}}
						>
							<SelectTrigger className="col-span-3">
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
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="caption" className="text-right">
							Caption
						</Label>
						<Textarea
							id="caption"
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="visibility" className="text-right">
							Visibility
						</Label>
						<Select
							value={visibility}
							onValueChange={(
								value:
									| 'PUBLIC_TO_EVERYONE'
									| 'SELF_ONLY'
									| 'MUTUAL_FOLLOW_FRIENDS'
									| 'FOLLOWER_OF_CREATOR'
							) => setVisibility(value)}
						>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Select visibility" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PUBLIC_TO_EVERYONE">Public</SelectItem>
								<SelectItem value="SELF_ONLY">Only you</SelectItem>
								<SelectItem value="MUTUAL_FOLLOW_FRIENDS">Friends</SelectItem>
								<SelectItem value="FOLLOWER_OF_CREATOR">Followers</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="additional-settings">
						<AccordionTrigger className="pt-0">Additional Settings</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label htmlFor="disable-duet">Disable Duet</Label>
									<Switch
										id="disable-duet"
										checked={disableDuet}
										onCheckedChange={setDisableDuet}
									/>
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
								{discloseVideoContent && (
									<div className="space-y-4">
										<Label>Video Content Type</Label>
										<RadioGroup
											value={videoContentType || ''}
											onValueChange={(value) =>
												setVideoContentType(value as 'yourBrand' | 'brandedContent')
											}
											className="space-y-2"
										>
											<TooltipProvider>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="yourBrand" id="yourBrand" />
													<Label htmlFor="yourBrand">Your Brand</Label>
													<Tooltip>
														<TooltipTrigger asChild>
															<InfoIcon className="h-4 w-4 text-gray-500" />
														</TooltipTrigger>
														<TooltipContent>
															<p>
																You are promoting yourself or your own business. This video will be
																classified as Business Organic.
															</p>
														</TooltipContent>
													</Tooltip>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="brandedContent" id="brandedContent" />
													<Label htmlFor="brandedContent">Branded Content</Label>
													<Tooltip>
														<TooltipTrigger asChild>
															<InfoIcon className="h-4 w-4 text-gray-500" />
														</TooltipTrigger>
														<TooltipContent>
															<p>
																You are promoting another brand or a third party. This video will be
																classified as Branded Content.
															</p>
														</TooltipContent>
													</Tooltip>
												</div>
											</TooltipProvider>
										</RadioGroup>
									</div>
								)}
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				<DialogFooter className="sm:justify-start">
					<div className="text-sm text-gray-500 mb-2">
						By posting, you agree to TikTok&apos;s{' '}
						<a
							href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline"
						>
							Music Usage Confirmation
						</a>
					</div>
					<Button
						onClick={() => handleupload()}
						disabled={
							isUploading ||
							!selectedAccount ||
							!caption ||
							(discloseVideoContent && !videoContentType)
						}
					>
						{isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Submit
					</Button>
				</DialogFooter>
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
