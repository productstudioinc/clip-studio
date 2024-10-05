'use client'

import * as React from 'react'
import { SelectPastRenders } from '@/db/schema'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpDown, Download, GridIcon, ListIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const columns: ColumnDef<SelectPastRenders>[] = [
  {
    accessorKey: 'templateName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          Template Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="px-0">{row.getValue('templateName')}</div>
    )
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          Rendered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="px-0">
        {formatDistanceToNow(row.getValue('createdAt'), { addSuffix: true })}
      </div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const render = row.original

      return (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(render.videoUrl || '#', '_blank')}
            disabled={!render.videoUrl}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      )
    }
  }
]
interface VideoRenderHistoryDataTableProps {
  videoRenderHistory: SelectPastRenders[]
}

export function VideoRenderHistoryDataTable({
  videoRenderHistory
}: VideoRenderHistoryDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid')
  const [filter, setFilter] = React.useState('')

  const data = React.useMemo(
    () => videoRenderHistory || [],
    [videoRenderHistory]
  )

  const filteredData = React.useMemo(() => {
    return data.filter((render) =>
      render.templateName.toLowerCase().includes(filter.toLowerCase())
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

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredData.map((render) => (
        <div key={render.id} className="border rounded-lg p-4">
          <div className="aspect-[9/16] bg-gray-200 mb-2 relative">
            <video
              src={render.videoUrl || ''}
              controls
              playsInline
              className="w-full h-full"
            />
          </div>
          <h3 className="font-semibold mb-1">{render.templateName}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {formatDistanceToNow(render.createdAt, { addSuffix: true })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(render.videoUrl || '#', '_blank')}
            disabled={!render.videoUrl}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      ))}
    </div>
  )

  const TableView = () => (
    <>
      <div className="rounded-md border">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )

  const PaginationButtons = () => (
    <div className="flex items-center justify-end space-x-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  )

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter templates..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-1 border p-1 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <GridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {viewMode === 'grid' ? <GridView /> : <TableView />}
      <PaginationButtons />
    </div>
  )
}
