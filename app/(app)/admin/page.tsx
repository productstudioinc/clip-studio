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

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { DateRangePicker } from '@/components/date-range-picker'
import { PerDayChart } from '@/components/per-day-chart'

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

  const [
    userCount,
    renderCount,
    feedbackCount,
    renderCountPerDay,
    userCountPerDay
  ] = await Promise.all([
    getUserCount(),
    getRenderCount(),
    getFeedbackCount(),
    getRenderCountPerDay(startDate, endDate),
    getUserCountPerDay(startDate, endDate)
  ])

  const renderChartData = renderCountPerDay.map(({ date, count }) => ({
    date,
    count: Number(count)
  }))

  const userChartData = userCountPerDay.map(({ date, count }) => ({
    date,
    count: Number(count)
  }))

  return (
    <>
      <div className="flex justify-between mb-4 flex-col md:flex-row">
        <h1 className="text-4xl font-bold mb-10">Admin Dashboard</h1>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Renders</CardTitle>
            <CardDescription>Showing total renders of all time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{renderCount}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Showing total users of all time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>Total feedback of all time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{feedbackCount}</p>
          </CardContent>
        </Card>
        <PerDayChart
          data={renderChartData}
          className="col-span-3"
          title="Renders Per Day"
          description="Showing total renders for the selected period"
          label="Renders"
          color="hsl(var(--chart-1))"
        />
        <PerDayChart
          data={userChartData}
          className="col-span-3"
          title="Users Per Day"
          description="Showing total users for the selected period"
          label="Users"
          color="hsl(var(--chart-2))"
        />
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
