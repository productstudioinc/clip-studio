import { getUser } from '@/actions/auth/user';
import { redirect } from 'next/navigation';
import LoginComponent from './LoginComponent';

export default async function Page() {
	const { user } = await getUser();
	if (user) {
		redirect('/');
	}
	return <LoginComponent />;
}
