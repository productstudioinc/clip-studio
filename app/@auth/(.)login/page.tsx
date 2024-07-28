'use client';

import LoginComponent from '@/app/(app_external)/login/LoginComponent';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createClient } from '@/supabase/clients';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_IN') {
				router.refresh();
			}
		});
		return () => subscription.unsubscribe();
	});

	return (
		<Dialog open={true} onOpenChange={() => router.back()}>
			<DialogContent className="p-0 border-0 max-w-sm">
				<LoginComponent />
			</DialogContent>
		</Dialog>
	);
}
