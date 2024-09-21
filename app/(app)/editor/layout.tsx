import React from 'react';

export default async function Layout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="flex flex-col p-4 lg:p-6 flex-grow overflow-hidden">
			<div className="flex items-center mb-4">
				{/* <h1 className="text-lg font-semibold md:text-2xl">{getTitle(currentRoute)}</h1> */}
			</div>

			<div className="flex flex-col lg:flex-row gap-4 min-h-0 flex-grow">
				<div className="w-full lg:w-1/2 overflow-hidden flex flex-col">
					<div className="flex-grow overflow-auto rounded-lg border shadow-sm p-4">{children}</div>
				</div>
				<div className="w-full lg:w-1/2 flex items-center justify-center bg-muted rounded-lg">
					<div className="w-full h-full max-h-[calc(50vw*16/9)] lg:max-h-[calc((100vh-60px-2rem)*0.9)] aspect-[9/16]">
						{/* <VideoPreview /> */}
					</div>
				</div>
			</div>
		</main>
	);
}
