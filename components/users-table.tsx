'use client'

import * as React from 'react'
import { UsersForAdmin } from '@/actions/db/admin-queries'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const columns: ColumnDef<UsersForAdmin>[] = [
  {
    accessorKey: 'fullName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="px-0">{row.getValue('fullName')}</div>
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="px-0">{row.getValue('role')}</div>
  },
  {
    accessorKey: 'usage.creditsLeft',
    header: 'Credits Left',
    cell: ({ row }) => (
      <div className="px-0">{row.original.usage?.creditsLeft}</div>
    )
  },
  {
    accessorKey: 'usage.connectedAccountsLeft',
    header: 'Connected Accounts Left',
    cell: ({ row }) => (
      <div className="px-0">{row.original.usage?.connectedAccountsLeft}</div>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => {
      return (
        <Button variant="outline" size="sm">
          View Details
        </Button>
      )
    }
  }
]

interface UsersTableProps {
  users: UsersForAdmin[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [filter, setFilter] = React.useState('')

  const data = React.useMemo(() => users || [], [users])

  const filteredData = React.useMemo(() => {
    return data.filter((user) =>
      user.fullName?.toLowerCase().includes(filter.toLowerCase())
    )
  }, [data, filter])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="px-4">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
