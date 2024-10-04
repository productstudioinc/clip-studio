import { Skeleton } from '@/components/ui/skeleton'

export default function CustomSkeleton() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex-grow space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
