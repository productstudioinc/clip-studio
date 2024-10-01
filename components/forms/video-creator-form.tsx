'use client';

import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import { ElevenlabsVoice } from '@/actions/elevenlabs';
import { TemplateSelect } from '@/components/form/template-select';
import { RedditForm } from '@/components/forms/reddit-form';
import { SplitScreenForm } from '@/components/forms/split-screen-form';
import { SelectBackgroundWithParts, SelectMusic, SelectTemplates } from '@/db/schema';
import { TemplateSchema, useTemplateStore } from '@/stores/templatestore';

interface VideoCreatorFormProps {
	voices: ElevenlabsVoice[];
	templates: SelectTemplates[];
	backgrounds: SelectBackgroundWithParts[];
	music: SelectMusic[];
	youtubeChannels: YoutubeChannel[];
	tiktokAccounts: TikTokAccount[];
}

export default function VideoCreatorForm({
	voices,
	templates,
	backgrounds,
	music,
	youtubeChannels,
	tiktokAccounts
}: VideoCreatorFormProps) {
	const { selectedTemplate } = useTemplateStore();

	const renderForm = () => {
		const props = { voices, backgrounds, youtubeChannels, tiktokAccounts, music };
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
