import { Skeleton } from '@/components/ui/skeleton';

export default function CustomSkeleton() {
	return (
		<div className="flex items-center space-x-4 p-4">
			<Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
			<div className="flex-grow space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	);
}
