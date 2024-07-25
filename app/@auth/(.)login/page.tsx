import LoginComponent from '@/app/(app_external)/login/LoginComponent';
import { Modal } from '@/components/modal';
import { getUser } from '@/utils/actions/user';
import { redirect } from 'next/navigation';

export default async function Page() {
	const { user } = await getUser();
	if (user) {
		redirect('/');
	}
	return (
		<Modal>
			<LoginComponent />
		</Modal>
	);
}
