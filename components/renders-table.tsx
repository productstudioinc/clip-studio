import Link from 'next/link'
import { RenderHistoryForAdmin } from '@/actions/db/admin-queries'
import { SelectPastRenders } from '@/db/schema'
import { formatDistanceToNow } from 'date-fns'
import { Download } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface RendersTableProps {
  renderHistory: RenderHistoryForAdmin[] | SelectPastRenders[]
}

export async function RendersTable({ renderHistory }: RendersTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderHistory.map((render) => (
            <TableRow key={render.id}>
              <TableCell>{render.templateName}</TableCell>
              <TableCell>{render.userId}</TableCell>
              <TableCell>
                {formatDistanceToNow(render.createdAt, {
                  addSuffix: true,
                  includeSeconds: true
                })}
              </TableCell>
              <TableCell>
                <Link
                  href={render.videoUrl || '#'}
                  target="_blank"
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                      size: 'sm'
                    }),
                    'w-full'
                  )}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
