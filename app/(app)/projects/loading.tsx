import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export default function Loading() {
  return (
    <>
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
        <div className="w-full">
          <div className="flex items-center py-4">
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">
                    <Skeleton className="h-8 w-32" />
                  </TableHead>
                  <TableHead className="px-4">
                    <Skeleton className="h-8 w-24" />
                  </TableHead>
                  <TableHead className="px-4">
                    <Skeleton className="h-8 w-24" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                    <TableCell className="px-4">
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell className="px-4">
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
    </>
  )
}
