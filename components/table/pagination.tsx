'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface PaginationProps {
  currentPage: number
  totalPages: number
  query: string
  pageSize: number
  view?: 'grid' | 'table'
}

export function Pagination({
  currentPage,
  totalPages,
  query,
  pageSize,
  view = 'grid'
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value)
    const searchParams = new URLSearchParams({
      page: '1',
      query,
      pageSize: newPageSize.toString(),
      view
    })
    router.push(`${pathname}?${searchParams.toString()}`)
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-x-2">
        {currentPage > 1 && (
          <Link
            href={{
              pathname,
              query: { page: currentPage - 1, query, pageSize, view }
            }}
          >
            <Button variant="outline" size="sm">
              Previous
            </Button>
          </Link>
        )}
        {currentPage < totalPages && (
          <Link
            href={{
              pathname,
              query: { page: currentPage + 1, query, pageSize, view }
            }}
          >
            <Button variant="outline" size="sm">
              Next
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
