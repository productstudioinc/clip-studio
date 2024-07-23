import Image from 'next/image';

type Link = {
	text: string;
	url: string;
};

const links: Link[] = [
	{ text: 'terms', url: '/terms' },
	{ text: 'privacy', url: '/privacy' }
];

export default function Hero() {
	return (
		<main className="container relative mx-auto p-4 md:p-16 gap-4 flex flex-col max-w-2xl lowercase">
			<section>
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1.5">
						<h1 className="text-2xl font-bold">Clip Studio</h1>
						<p className="max-w-md text-pretty text-sm text-muted-foreground">
							Create viral social media content using AI
						</p>
					</div>
				</div>
			</section>
			<footer>
				<div className="flex items-center justify-between gap-x-5">
					<div className="flex items-center gap-x-2">
						<Image
							className="h-8 w-8 rounded-full"
							src="/logo.svg"
							alt="Company Logo"
							width={8}
							height={8}
						/>
						<h2 className="text-base font-bold text-neutral-900 dark:text-white">Clip Studio</h2>
					</div>

					<ul className="flex items-center justify-center gap-x-10">
						{links.map((link, index) => (
							<li
								key={index}
								className="text-[15px]/normaltext-neutral-400 transition-all duration-100 ease-linear hover:text-neutral-900 hover:underline hover:underline-offset-4 dark:text-neutral-400 hover:dark:text-neutral-100"
							>
								<a href={link.url}>{link.text}</a>
							</li>
						))}
					</ul>
				</div>
			</footer>
		</main>
	);
}
