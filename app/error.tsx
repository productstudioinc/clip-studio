'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	console.error(error);
	const router = useRouter();
	return (
		<section>
			<div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center px-6 py-12">
				<div className="mx-auto flex max-w-sm flex-col items-center text-center">
					<p className="rounded-full bg-blue-50 p-3 text-sm font-medium dark:bg-gray-800">
						<TriangleAlert className="h-6 w-6" />
					</p>
					<h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
						Something went wrong
					</h1>
					<p className="mt-4 text-gray-500 dark:text-gray-400">
						An error occurred while processing your request.
					</p>

					<div className="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
						<Button
							onClick={() => router.back()}
							className={cn(buttonVariants({ variant: 'secondary' }), 'group')}
						>
							<ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
							<span>Go back</span>
						</Button>

						<Button onClick={() => reset()} className={buttonVariants({ variant: 'default' })}>
							Try again
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
