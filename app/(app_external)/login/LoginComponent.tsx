'use client';
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
		<div className="flex items-center justify-center min-h-screen pb-48">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
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
							<GoogleIcon className="mr-2 h-4 w-4" />
							Login with Google
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

const GoogleIcon: React.FC<{
	className?: string;
}> = ({ className }) => {
	return (
		<svg
			fill="#000000"
			width="800px"
			height="800px"
			viewBox="0 0 512 512"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<title>ionicons-v5_logos</title>
			<path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z" />
		</svg>
	);
};
