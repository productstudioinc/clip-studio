'use client';

import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import { ElevenlabsVoice } from '@/actions/elevenlabs';
import { TemplateSelect } from '@/components/form/template-select';
import { RedditForm } from '@/components/forms/reddit-form';
import { SplitScreenForm } from '@/components/forms/split-screen-form';
import { SelectBackgroundWithParts, SelectTemplates } from '@/db/schema';
import { TemplateSchema, useTemplateStore, VideoProps } from '@/stores/templatestore';
import { toast } from 'sonner';

interface VideoCreatorFormProps {
	voices: ElevenlabsVoice[];
	templates: SelectTemplates[];
	backgrounds: SelectBackgroundWithParts[];
	youtubeChannels: YoutubeChannel[];
	tiktokAccounts: TikTokAccount[];
}

export default function VideoCreatorForm({
	voices,
	templates,
	backgrounds,
	youtubeChannels,
	tiktokAccounts
}: VideoCreatorFormProps) {
	const { selectedTemplate } = useTemplateStore();

	const onSubmit = async (values: VideoProps) => {
		console.log('Form submitted:', { ...values });
		try {
			if (process.env.NODE_ENV === 'development') {
				toast.info('Form Inputs (Development Mode)', {
					description: (
						<pre className="max-h-80 overflow-auto">{JSON.stringify(values, null, 2)}</pre>
					),
					duration: 0
				});
			} else {
				// In production mode, call the API to start video generation
				toast.success('Video generation started', {
					description: 'Your video is being generated. This may take a few minutes.',
					duration: 10000
				});
			}

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error('Failed to start video generation', {
				description: 'An error occurred. Please try again.'
			});
		}
	};

	const renderForm = () => {
		const props = { onSubmit, voices, backgrounds, youtubeChannels, tiktokAccounts };
		switch (selectedTemplate) {
			case TemplateSchema.Enum.Reddit:
				return <RedditForm {...props} />;
			case TemplateSchema.Enum.SplitScreen:
				return <SplitScreenForm {...props} />;
			// case TemplateSchema.Enum.TwitterThread:
			//   return <TwitterForm onSubmit={handleSubmit} />;
			default:
				return null;
		}
	};

	return (
		<div className="w-full max-w-7xl mx-auto p-4 space-y-8">
			<TemplateSelect templates={templates} />
			{renderForm()}
		</div>
	);
}
