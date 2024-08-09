import { getUser } from '@/actions/auth/user';
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries';
import { getVoices } from '@/actions/elevenlabs';
import TextForm from '@/app/(app)/editor/text-form';

export default async function Page() {
	const { user } = await getUser();
	const voices = await getVoices();

	const { youtubeChannels, tiktokAccounts } = user
		? await fetchUserConnectSocialMediaAccounts(user.id)
		: { youtubeChannels: [], tiktokAccounts: [] };

	return (
		<TextForm youtubeChannels={youtubeChannels} tiktokAccounts={tiktokAccounts} voices={voices} />
	);
}
