<<<<<<< HEAD
import { getUser } from '@/actions/auth/user';
=======
import LoginComponent from '@/app/(app_external)/login/LoginComponent';
import { getUser } from '@/utils/actions/user';
>>>>>>> 8b25cb8dfc3010dc91459a3aaf2936df889f5649
import { redirect } from 'next/navigation';

export default async function Page() {
	const { user } = await getUser();
	if (user) {
		redirect('/');
	}
	return <LoginComponent />;
}
