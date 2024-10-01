import { getUser } from '@/actions/auth/user';
import { getBackgrounds, getMusic, getTemplates } from '@/actions/db/page-data';
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries';
import { getVoices } from '@/actions/elevenlabs';
import VideoCreatorForm from '@/components/forms/video-creator-form';

export default async function Page() {
	const [{ user }, voices, templates, backgrounds, music] = await Promise.all([
		getUser(),
		getVoices(),
		getTemplates(),
		getBackgrounds(),
		getMusic()
	]);

	const { youtubeChannels, tiktokAccounts } = user
		? await fetchUserConnectSocialMediaAccounts(user.id)
		: { youtubeChannels: [], tiktokAccounts: [] };

	return (
		<VideoCreatorForm
			voices={voices}
			templates={templates}
			backgrounds={backgrounds}
			music={music}
			youtubeChannels={youtubeChannels}
			tiktokAccounts={tiktokAccounts}
		/>
	);
}
