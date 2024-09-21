import { getUser } from '@/actions/auth/user';
import { getTemplates } from '@/actions/db/page-data';
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries';
import { getVoices } from '@/actions/elevenlabs';
import VideoCreatorForm from '@/components/forms/video-creator-form';

export default async function Page() {
	const { user } = await getUser();
	const voices = await getVoices();
	const [templates] = await Promise.all([getTemplates()]);

	const { youtubeChannels, tiktokAccounts } = user
		? await fetchUserConnectSocialMediaAccounts(user.id)
		: { youtubeChannels: [], tiktokAccounts: [] };

	return (
		<VideoCreatorForm
			voices={voices}
			templates={templates}
			youtubeChannels={youtubeChannels}
			tiktokAccounts={tiktokAccounts}
		/>
	);
}
