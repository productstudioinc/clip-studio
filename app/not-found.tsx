import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="container relative mx-auto pb-16 flex flex-col lowercase items-center justify-center min-h-screen">
			<section>
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1.5">
						<h1 className="text-2xl font-bold">Page not found</h1>
						<Link
							href="/"
							className="transition-all text-muted-foreground duration-100 ease-linear hover:text-neutral-900 hover:underline hover:underline-offset-4 dark:text-neutral-400 hover:dark:text-neutral-100"
						>
							head back to the home page
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
