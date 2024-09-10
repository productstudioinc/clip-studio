import { getUser } from '@/actions/auth/user';
import { getVideoRenderHistory } from '@/actions/db/user-queries';
import { VideoRenderHistoryDataTable } from '@/components/video-render-history-data-table';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
	const { user } = await getUser();

	if (!user) {
		redirect('/');
	}

	const videoRenderHistory = await getVideoRenderHistory();
	return (
		<>
			<div className="mx-auto grid w-full max-w-6xl gap-2">
				<h1 className="text-3xl font-semibold">Projects</h1>
			</div>
			<div className="mx-auto grid w-full max-w-6xl items-start gap-6">
				<VideoRenderHistoryDataTable videoRenderHistory={videoRenderHistory || []} />
			</div>
		</>
	);
}
