import { Suspense } from 'react'
import { getFeedbackForAdmin } from '@/actions/db/admin-queries'

import { FeedbackTable } from '@/components/feedback-table'
import { Pagination } from '@/components/table/pagination'
import Search from '@/components/table/search'
import CustomSkeleton from '@/app/(app)/editor/loading'

export default async function Page(
  props: {
    searchParams?: Promise<{
      query?: string
      page?: string
      pageSize?: string
    }>
  }
) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const pageSize = Number(searchParams?.pageSize) || 10

  const { feedback, totalPages } = await getFeedbackForAdmin(
    currentPage,
    pageSize,
    query
  )

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold">All Feedback</h1>
      <div className="flex justify-between items-center">
        <Search placeholder="Search for a user" />
      </div>

      <Suspense
        key={`${query}-${currentPage}-${pageSize}`}
        fallback={<CustomSkeleton />}
      >
        <FeedbackTable feedback={feedback} />
      </Suspense>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        pageSize={pageSize}
      />
    </div>
  )
}
