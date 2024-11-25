import { Suspense } from 'react'
import { getRenderHistory } from '@/actions/db/admin-queries'

import { RendersGrid } from '@/components/renders-grid'
import { RendersTable } from '@/components/renders-table'
import { Pagination } from '@/components/table/pagination'
import Search from '@/components/table/search'
import { ViewToggle } from '@/components/table/view-toggle'
import CustomSkeleton from '@/app/(app)/editor/loading'

export default async function Page(
  props: {
    searchParams?: Promise<{
      query?: string
      page?: string
      pageSize?: string
      view?: 'grid' | 'table'
    }>
  }
) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const pageSize = Number(searchParams?.pageSize) || 10
  const view = searchParams?.view || 'grid'

  const { renderHistory, totalPages } = await getRenderHistory(
    currentPage,
    pageSize,
    query
  )

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold">All Projects</h1>
      <div className="flex justify-between items-center">
        <Search placeholder="Search for a render" />
        <ViewToggle />
      </div>

      {view === 'grid' ? (
        <Suspense
          key={`${query}-${currentPage}-${pageSize}-grid`}
          fallback={<CustomSkeleton />}
        >
          <RendersGrid renderHistory={renderHistory} />
        </Suspense>
      ) : (
        <Suspense
          key={`${query}-${currentPage}-${pageSize}-table`}
          fallback={<CustomSkeleton />}
        >
          <RendersTable renderHistory={renderHistory} />
        </Suspense>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        pageSize={pageSize}
        view={view}
      />
    </div>
  )
}
