import { fetchUserConnectSocialMediaAccounts } from '@/utils/actions/socialMediaAccounts';
import { getUser } from '@/utils/actions/user';
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
