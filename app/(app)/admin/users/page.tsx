import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import { checkAdminStatus, getUsersForAdmin } from '@/actions/db/admin-queries'

import { Pagination } from '@/components/table/pagination'
import Search from '@/components/table/search'
import { UsersTable } from '@/components/users-table'
import CustomSkeleton from '@/app/(app)/editor/loading'

export default async function Page({
  searchParams
}: {
  searchParams?: {
    query?: string
    page?: string
    pageSize?: string
  }
}) {
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const pageSize = Number(searchParams?.pageSize) || 10

  const { user } = await getUser()

  if (!user) {
    redirect('/')
  }

  const isAdmin = await checkAdminStatus(user.id)

  if (!isAdmin) {
    redirect('/')
  }

  const { users, totalPages } = await getUsersForAdmin(
    currentPage,
    pageSize,
    query
  )

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold">All Users</h1>
      <div className="flex justify-between items-center">
        <Search placeholder="Search for a user" />
      </div>
      <Suspense
        key={`${query}-${currentPage}-${pageSize}`}
        fallback={<CustomSkeleton />}
      >
        <UsersTable users={users} />
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
