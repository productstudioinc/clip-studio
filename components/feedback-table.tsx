'use client'

import Link from 'next/link'
import { FeedbackForAdmin } from '@/actions/db/admin-queries'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

interface FeedbackTableProps {
  feedback: FeedbackForAdmin[]
}

export function FeedbackTable({ feedback }: FeedbackTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={item.user?.avatarUrl ?? ''} />
                    <AvatarFallback>
                      {item.user?.fullName?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  {item.user?.fullName || 'Anonymous'}
                </div>
              </TableCell>
              <TableCell>{item.feedbackType}</TableCell>
              <TableCell>{item.rating || 'N/A'}</TableCell>
              <TableCell>{item.comment || 'No comment'}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  includeSeconds: true
                })}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/feedback/${item.id}`}
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                      size: 'sm'
                    }),
                    'w-full'
                  )}
                >
                  View Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
