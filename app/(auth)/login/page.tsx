import { getUser } from '@/actions/auth/user';
import LoginComponent from '@/components/login-form';
import { redirect } from 'next/navigation';

export default async function Page() {
	const { user } = await getUser();
	if (user) {
		redirect('/');
	}
	return <LoginComponent />;
}
