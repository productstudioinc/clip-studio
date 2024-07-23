/* eslint-disable @next/next/no-img-element */
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { SelectBackgroundWithParts } from '@/db/schema';
import { useTemplateStore } from '@/stores/templatestore';
import type { FC } from 'react';

type BackgroundSelectProps = {
	backgrounds: SelectBackgroundWithParts[];
};

export const BackgroundSelect: FC<BackgroundSelectProps> = ({ backgrounds }) => {
	const { backgroundTheme, setBackgroundTheme, setBackgroundUrls } = useTemplateStore((state) => ({
		backgroundTheme: state.backgroundTheme,
		setBackgroundTheme: state.setBackgroundTheme,
		setBackgroundUrls: state.setBackgroundUrls
	}));

	const handleSelect = (background: SelectBackgroundWithParts) => {
		setBackgroundTheme(background.name as 'Minecraft' | 'GTA' | 'Satisfying');
		setBackgroundUrls(background.backgroundParts.map((part) => part.partUrl));
	};

	return (
		<>
			<h2 className="text-2xl font-semibold leading-none tracking-tight pt-2 pb-6">
				Select a background
			</h2>
			<div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
				{backgrounds.map((background) => (
					<div
						key={background.id}
						onClick={() => handleSelect(background)}
						className="cursor-pointer"
					>
						<Card
							className={`h-full transition-all duration-300 ${
								backgroundTheme === background.name ? 'ring-2 ring-primary' : 'hover:shadow-md'
							}`}
						>
							<CardContent className="p-1">
								<div className="relative w-full pt-[56.25%]">
									<video
										src={background.previewUrl}
										className="absolute inset-0 w-full h-full object-cover rounded-lg"
										autoPlay
										loop
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				))}
			</div>
		</>
	);
};
