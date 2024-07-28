// app/error.tsx
'use client'; // Error components must be Client Components

import { Button } from '@/components/ui/button';

export default function Error({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	console.error(error);
	return (
		<main className="container relative mx-auto pb-16 flex flex-col lowercase items-center justify-center min-h-screen">
			<section>
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1.5">
						<h1 className="text-2xl font-bold">Something went wrong</h1>
						<Button variant={'ghost'} onClick={() => reset()}>
							Try again
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
