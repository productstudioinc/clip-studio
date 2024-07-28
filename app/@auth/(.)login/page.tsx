'use client';

import LoginComponent from '@/app/(app_external)/login/LoginComponent';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function Page() {
	const router = useRouter();
	return (
		<Dialog open={true} onOpenChange={(open) => !open && router.back()}>
			<DialogContent className="p-0 border-0 max-w-sm">
				<LoginComponent />
			</DialogContent>
		</Dialog>
	);
}
