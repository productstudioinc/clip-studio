import { getUser } from '@/actions/auth/user';
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries';
import { redirect } from 'next/navigation';
import { RenderControls } from './render-component';

export default async function ExportPage() {
	const { user } = await getUser();
	if (!user) {
		redirect('/login');
	}
	const { youtubeChannels } = await fetchUserConnectSocialMediaAccounts(user.id);
	return <RenderControls youtubeChannels={youtubeChannels} />;
}
