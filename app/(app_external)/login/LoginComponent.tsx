'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/supabase/clients';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginComponent() {
	const supabase = createClient();
	const router = useRouter();

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
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>Login through one of our supported providers</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<Button
						variant="outline"
						className="w-full"
						onClick={() => {
							supabase.auth.signInWithOAuth({
								provider: 'google',
								options: {
									redirectTo: `${location.origin}/auth/callback`
								}
							});
						}}
					>
						<Icons.google className="mr-2 h-4 w-4" />
						Login with Google
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
