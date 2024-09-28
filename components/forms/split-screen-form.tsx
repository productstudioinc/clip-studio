'use client';

import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import { ElevenlabsVoice } from '@/actions/elevenlabs';
import { AspectRatioStep } from '@/components/form/aspect-ratio-step';
import { BackgroundSelectStep } from '@/components/form/background-select-step';
import { FormErrors } from '@/components/form/form-errors';
import { FormSubmit } from '@/components/form/form-submit';
import { VideoPreview } from '@/components/form/video-preview';
import { VoiceStep } from '@/components/form/voice-step';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { SelectBackgroundWithParts } from '@/db/schema';
import {
	defaultSplitScreenProps,
	SplitScreenVideoProps,
	SplitScreenVideoSchema,
	useTemplateStore,
	VideoProps
} from '@/stores/templatestore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface SplitScreenFormProps {
	voices: ElevenlabsVoice[];
	backgrounds: SelectBackgroundWithParts[];
	youtubeChannels: YoutubeChannel[];
	tiktokAccounts: TikTokAccount[];
}

export const SplitScreenForm: React.FC<SplitScreenFormProps> = ({
	voices,
	backgrounds,
	youtubeChannels,
	tiktokAccounts
}) => {
	const form = useForm<VideoProps>({
		resolver: zodResolver(SplitScreenVideoSchema),
		defaultValues: defaultSplitScreenProps
	});

	const setSplitScreenState = useTemplateStore((state) => state.setSplitScreenState);

	// Add this effect to update the store when form values change
	useEffect(() => {
		const subscription = form.watch((value) => {
			setSplitScreenState(value as Partial<SplitScreenVideoProps>);
		});
		return () => subscription.unsubscribe();
	}, [form, setSplitScreenState]);

	return (
		<Form {...form}>
			<form className="w-full space-y-6">
				<div className="flex flex-col lg:flex-row gap-8">
					<div className="w-full lg:w-3/5 space-y-6">
						{/* <VideoUploadStep form={form} /> */}
						<VoiceStep form={form} voices={voices} />
						{/* <MusicStep form={form} /> */}
						<BackgroundSelectStep form={form} backgrounds={backgrounds} />
						<AspectRatioStep form={form} />
						<FormErrors form={form} />
						<FormSubmit
							form={form}
							youtubeChannels={youtubeChannels}
							tiktokAccounts={tiktokAccounts}
						/>
					</div>

					<div className="w-full lg:w-2/5">
						<div className="sticky top-20 space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
							<VideoPreview form={form} />
							<Card>
								<CardHeader>
									<CardTitle>Additional Information</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										This section can include more details about the selected options, tips for
										creating split-screen videos, or any other relevant information that might be
										helpful for the user during the video creation process.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</form>
		</Form>
	);
};
