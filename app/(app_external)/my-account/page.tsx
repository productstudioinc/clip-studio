import { getUser } from '@/actions/auth/user';
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries';
import { connectYoutubeAccount } from '@/actions/youtube';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
	const { user } = await getUser();
	if (!user) {
		redirect('/login');
	}
	const { youtubeChannels } = await fetchUserConnectSocialMediaAccounts(user.id);
	return (
		<main className="flex flex-col">
			<div>connected accs</div>
			<div>youtube channels</div>
			<form action={connectYoutubeAccount}>
				<Button>Connect YouTube</Button>
			</form>
			<div>youtubeChannels</div>
			{youtubeChannels.map((channel) => (
				<div key={channel.id}>
					<img src={channel.profile_picture_path as string} />
					<div>{channel.channelCustomUrl}</div>
					<div>{channel.error}</div>
				</div>
			))}
		</main>
	);
}
