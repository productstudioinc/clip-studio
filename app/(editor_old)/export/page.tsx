import { getUser } from '@/actions/auth/user';
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries';
import { RenderControls } from './render-component';

export default async function ExportPage() {
	const { user } = await getUser();
	const { youtubeChannels = [], tiktokAccounts = [] } = user
		? await fetchUserConnectSocialMediaAccounts(user.id)
		: {};
	return <RenderControls youtubeChannels={youtubeChannels} tiktokAccounts={tiktokAccounts} />;
}
