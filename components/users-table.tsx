import Link from 'next/link'
import { UsersForAdmin } from '@/actions/db/admin-queries'
import { formatDistanceToNow } from 'date-fns'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface UsersTableProps {
  users: UsersForAdmin[]
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Credits Left</TableHead>
            <TableHead>Connected Accounts Left</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <Link href={`/admin/users/${user.id}`} className="contents">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl ?? ''} />
                      <AvatarFallback>
                        {user.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {user.fullName}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                    includeSeconds: true
                  })}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.usage?.creditsLeft}</TableCell>
                <TableCell>{user.usage?.connectedAccountsLeft}</TableCell>
              </Link>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
