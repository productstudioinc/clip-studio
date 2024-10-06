import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import {
  checkAdminStatus,
  getFeedbackCount,
  getRenderCount,
  getRenderCountPerDay,
  getUserCount,
  getUserCountPerDay
} from '@/actions/db/admin-queries'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/date-range-picker'
import { PerDayChart } from '@/components/per-day-chart'

const CardSkeleton = ({ className }: { className?: string }) => (
  <Skeleton className={cn(`h-[140px] w-full `, className)} />
)

const RenderCountCard = async () => {
  const renderCount = await getRenderCount()
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Renders</CardTitle>
        <CardDescription>Showing total renders of all time</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{renderCount}</p>
      </CardContent>
    </Card>
  )
}

const UserCountCard = async () => {
  const userCount = await getUserCount()
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Showing total users of all time</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{userCount}</p>
      </CardContent>
    </Card>
  )
}

const FeedbackCountCard = async () => {
  const feedbackCount = await getFeedbackCount()
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>Total feedback of all time</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{feedbackCount}</p>
      </CardContent>
    </Card>
  )
}

const RenderChart = async ({
  startDate,
  endDate
}: {
  startDate: Date
  endDate: Date
}) => {
  const renderCountPerDay = await getRenderCountPerDay(startDate, endDate)
  const renderChartData = renderCountPerDay.map(({ date, count }) => ({
    date,
    count: Number(count)
  }))
  return (
    <PerDayChart
      data={renderChartData}
      className="col-span-3"
      title="Renders Per Day"
      description="Showing total renders for the selected period"
      label="Renders"
      color="hsl(var(--chart-1))"
    />
  )
}

const UserChart = async ({
  startDate,
  endDate
}: {
  startDate: Date
  endDate: Date
}) => {
  const userCountPerDay = await getUserCountPerDay(startDate, endDate)
  const userChartData = userCountPerDay.map(({ date, count }) => ({
    date,
    count: Number(count)
  }))
  return (
    <PerDayChart
      data={userChartData}
      className="col-span-3"
      title="Users Per Day"
      description="Showing total users for the selected period"
      label="Users"
      color="hsl(var(--chart-2))"
    />
  )
}

export default async function AdminDashboard({
  searchParams
}: {
  searchParams?: {
    from?: string
    to?: string
    preset?: string
  }
}) {
  const { user } = await getUser()

  if (!user) {
    redirect('/')
  }

  const isAdmin = await checkAdminStatus(user.id)

  if (!isAdmin) {
    redirect('/')
  }

  const startDate = searchParams?.from
    ? new Date(new Date(searchParams.from).setHours(0, 0, 0, 0))
    : new Date(new Date().setHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000) // Default to beginning of 30 days ago
  const endDate = searchParams?.to
    ? new Date(new Date(searchParams.to).setHours(23, 59, 59, 999))
    : new Date(new Date().setHours(23, 59, 59, 999)) // Default to end of today

  return (
    <>
      <div className="flex justify-between mb-4 flex-col md:flex-row">
        <h1 className="text-4xl font-bold mb-10">Admin Dashboard</h1>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">
        <Suspense fallback={<CardSkeleton className="col-span-2" />}>
          <RenderCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton className="col-span-2" />}>
          <UserCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton className="col-span-2" />}>
          <FeedbackCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton className="h-[250px] col-span-3" />}>
          <RenderChart startDate={startDate} endDate={endDate} />
        </Suspense>
        <Suspense fallback={<CardSkeleton className="h-[250px] col-span-3" />}>
          <UserChart startDate={startDate} endDate={endDate} />
        </Suspense>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Render History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and manage all user render history.</p>
            <Link href="/admin/renders">
              <Button>View Renders</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage user accounts and permissions.</p>
            <Link href="/admin/users">
              <Button>View Users</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View user feedback and suggestions.</p>
            <Link href="/admin/feedback">
              <Button>View Feedback</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
