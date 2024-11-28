import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import {
  getUserProfileForAdmin,
  UserProfileForAdmin
} from '@/actions/db/admin-queries'
import { format } from 'date-fns'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FeedbackTable } from '@/components/feedback-table'
import { RendersGrid } from '@/components/renders-grid'
import { RendersTable } from '@/components/renders-table'
import { Pagination } from '@/components/table/pagination'
import { ViewToggle } from '@/components/table/view-toggle'
import UserSubscriptionCard, {
  UserSubscriptionCardSkeleton
} from '@/components/user-subscription-card'
import CustomSkeleton from '@/app/(app)/editor/loading'

interface UserProfilePageProps {
  params: {
    slug: string
  }
  searchParams?: {
    page?: string
    pageSize?: string
    view?: 'grid' | 'table'
  }
}

export default async function UserProfilePage({
  params,
  searchParams
}: UserProfilePageProps) {
  const currentPage = Number(searchParams?.page) || 1
  const pageSize = Number(searchParams?.pageSize) || 10
  const view = searchParams?.view || 'grid'

  try {
    const { user, renders, feedback, totalPages } =
      (await getUserProfileForAdmin(
        params.slug,
        currentPage,
        pageSize
      )) as UserProfileForAdmin

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl ?? ''} />
                <AvatarFallback>
                  {user.fullName?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.fullName}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {format(new Date(user.createdAt), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Left</p>
                <p className="font-medium">{user.usage?.creditsLeft}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Connected Accounts
                </p>
                <p className="font-medium">
                  {user.usage?.connectedAccountsLeft}
                </p>
              </div>

              <Suspense
                fallback={
                  <UserSubscriptionCardSkeleton className="col-span-2" />
                }
              >
                <UserSubscriptionCard
                  className="col-span-2"
                  subscriptionId={user.subscription?.id ?? ''}
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Feedback</h2>
            <Suspense fallback={<CustomSkeleton />}>
              <FeedbackTable feedback={feedback} />
            </Suspense>
          </div>
          <Separator />
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Renders</h2>
              <ViewToggle />
            </div>

            <Suspense
              key={`${currentPage}-${pageSize}-${view}`}
              fallback={<CustomSkeleton />}
            >
              {view === 'grid' ? (
                <RendersGrid renderHistory={renders} />
              ) : (
                <RendersTable renderHistory={renders} />
              )}
            </Suspense>

            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                view={view}
              />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
