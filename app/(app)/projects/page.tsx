import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import { getVideoRenderHistory } from '@/actions/db/user-queries'

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

  const { user } = await getUser()

  if (!user) {
    redirect('/')
  }

  const result = await getVideoRenderHistory(currentPage, pageSize, query)
  const { renderHistory, totalPages } = result || {
    renderHistory: [],
    totalPages: 0
  }

  return (
    <>
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">My Projects</h1>
        <div className="flex justify-between items-center">
          <Search placeholder="Search for a render" />
          <ViewToggle />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 mt-4">
        {view === 'grid' ? (
          <Suspense
            key={`${query}-${currentPage}-grid`}
            fallback={<CustomSkeleton />}
          >
            <RendersGrid renderHistory={renderHistory} />
          </Suspense>
        ) : (
          <Suspense
            key={`${query}-${currentPage}-table`}
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
    </>
  )
}
