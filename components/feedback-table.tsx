import Link from 'next/link'
import { FeedbackForAdmin } from '@/actions/db/admin-queries'
import { formatDistanceToNow } from 'date-fns'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface FeedbackTableProps {
  feedback: FeedbackForAdmin[]
}

export function FeedbackTable({ feedback }: FeedbackTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.length > 0 ? (
            feedback.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <Link href={`/admin/users/${item.userId}`} className="contents">
                  <TableCell>{item.feedbackType}</TableCell>
                  <TableCell>{item.rating || 'N/A'}</TableCell>
                  <TableCell className="overflow-x-auto max-w-xs">
                    <div className="overflow-x-auto">
                      {item.comment || 'No comment'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      includeSeconds: true
                    })}
                  </TableCell>
                </Link>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No feedback available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
