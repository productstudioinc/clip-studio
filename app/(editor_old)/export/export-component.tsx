'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { State } from '@/utils/helpers/use-rendering';

const Megabytes: React.FC<{
	sizeInBytes: number;
	className?: string;
}> = ({ sizeInBytes, className }) => {
	const megabytes = Intl.NumberFormat('en', {
		notation: 'compact',
		style: 'unit',
		unit: 'byte',
		unitDisplay: 'narrow'
	}).format(sizeInBytes);
	return <span className={cn('opacity-60', className)}>({megabytes})</span>;
};

export const ExportComponent: React.FC<{
	state: State;
	undo: () => void;
}> = ({ state, undo }) => {
	const isDownloadReady = state.status === 'done';

	return (
		<div className="w-full">
			{isDownloadReady ? (
				<a href={state.url}>
					<Button className="w-full h-12 text-md">
						Download
						<Megabytes sizeInBytes={state.size} className="ml-1" />
					</Button>
				</a>
			) : (
				<Button disabled className="w-full h-12 text-md">
					Download
				</Button>
			)}
		</div>
	);
};
