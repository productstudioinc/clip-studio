import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import {
  checkAdminStatus,
  getFeedbackCount,
  getFeedbackCountPerDay,
  getMostRecentRenders,
  getRenderCount,
  getRenderCountPerDay,
  getTikTokAccountsCount,
  getTikTokPostsCount,
  getTikTokPostsPerDay,
  getUserCount,
  getUserCountPerDay,
  getYoutubeAccountsCount,
  getYoutubePostsCount,
  getYoutubePostsPerDay
} from '@/actions/db/admin-queries'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { DateRangePicker } from '@/components/date-range-picker'
import { PerDayChart } from '@/components/per-day-chart'

const CardSkeleton = ({ className }: { className?: string }) => (
  <Card className={cn('col-span-12 sm:col-span-6 lg:col-span-4', className)}>
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/4" />
    </CardContent>
  </Card>
)

const ChartSkeleton = ({ className }: { className?: string }) => (
  <Card className={cn('h-[250px]', className)}>
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[180px] w-full" />
    </CardContent>
  </Card>
)

const CountCard = async ({
  title,
  description,
  count,
  href,
  tooltipText
}: {
  title: string
  description: string
  count: number
  href: string
  tooltipText: string
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className="block col-span-12 sm:col-span-6 lg:col-span-4"
          >
            <Card className="relative group overflow-hidden transition-all duration-300 hover:opacity-80">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{count}</p>
              </CardContent>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 duration-300 ease-in-out">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const RenderCountCard = async () => {
  const renderCount = await getRenderCount()
  return (
    <CountCard
      title="Renders"
      description="Total renders of all time"
      count={renderCount}
      href="/admin/renders"
      tooltipText="Click to view all renders"
    />
  )
}

const UserCountCard = async () => {
  const userCount = await getUserCount()
  return (
    <CountCard
      title="Users"
      description="Total users of all time"
      count={userCount}
      href="/admin/users"
      tooltipText="Click to view all users"
    />
  )
}

const FeedbackCountCard = async () => {
  const feedbackCount = await getFeedbackCount()
  return (
    <CountCard
      title="Feedback"
      description="Total feedback of all time"
      count={feedbackCount}
      href="/admin/feedback"
      tooltipText="Click to view all feedback"
    />
  )
}
const YoutubePostsCountCard = async () => {
  const youtubePostsCount = await getYoutubePostsCount()
  return (
    <Card className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Youtube Posts</CardTitle>
        <CardDescription>Total Youtube posts of all time</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="text-3xl font-bold">{youtubePostsCount}</p>
      </CardContent>
    </Card>
  )
}

const TikTokPostsCountCard = async () => {
  const tikTokPostsCount = await getTikTokPostsCount()
  return (
    <Card className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between">
      <CardHeader>
        <CardTitle>TikTok Posts</CardTitle>
        <CardDescription>Total TikTok posts of all time</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="text-3xl font-bold">{tikTokPostsCount}</p>
      </CardContent>
    </Card>
  )
}

const YoutubeAccountsCountCard = async () => {
  const youtubeAccountsCount = await getYoutubeAccountsCount()
  return (
    <Card className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Youtube Accounts</CardTitle>
        <CardDescription>Total Youtube accounts of all time</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="text-3xl font-bold">{youtubeAccountsCount}</p>
      </CardContent>
    </Card>
  )
}

const TikTokAccountsCountCard = async () => {
  const tikTokAccountsCount = await getTikTokAccountsCount()
  return (
    <Card className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between">
      <CardHeader>
        <CardTitle>TikTok Accounts</CardTitle>
        <CardDescription>Total TikTok accounts of all time</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="text-3xl font-bold">{tikTokAccountsCount}</p>
      </CardContent>
    </Card>
  )
}

const MostRecentRendersCard = async () => {
  const mostRecentRenders = await getMostRecentRenders()
  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Recent Renders</CardTitle>
          <CardDescription>
            Showing the most recent renders limited to 10
          </CardDescription>
        </div>
        <Link
          href="/admin/renders"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          View all renders
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {mostRecentRenders.map((render) => (
              <div
                key={render.id}
                className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border border-muted bg-popover hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out overflow-hidden"
              >
                <video
                  src={render.videoUrl || ''}
                  width={300}
                  height={400}
                  controls
                  playsInline
                  className="aspect-[9/16] object-cover rounded-t-md"
                />
                <div className="w-full p-2 text-center flex flex-col">
                  <span className="font-semibold">{render.templateName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(render.createdAt), {
                      addSuffix: true
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
      className="col-span-12"
      title="Renders Per Day"
      description="Showing total renders for the selected period"
      label="Renders"
      color="hsl(var(--chart-1))"
    />
  )
}

const FeedbackChart = async ({
  startDate,
  endDate
}: {
  startDate: Date
  endDate: Date
}) => {
  const feedbackCountPerDay = await getFeedbackCountPerDay(startDate, endDate)
  const feedbackChartData = feedbackCountPerDay.map(({ date, count }) => ({
    date,
    count: Number(count)
  }))
  return (
    <PerDayChart
      data={feedbackChartData}
      className="col-span-12 md:col-span-6"
      title="Feedback Per Day"
      description="Showing total feedback for the selected period"
      label="Feedback"
      color="hsl(var(--chart-3))"
    />
  )
}

const TikTokPostsChart = async ({
  startDate,
  endDate
}: {
  startDate: Date
  endDate: Date
}) => {
  const tikTokPostsPerDay = await getTikTokPostsPerDay(startDate, endDate)
  const tikTokPostsChartData = tikTokPostsPerDay.map(({ date, count }) => ({
    date,
    count: Number(count)
  }))
  return (
    <PerDayChart
      data={tikTokPostsChartData}
      className="col-span-12 md:col-span-6"
      title="TikTok Posts Per Day"
      description="Showing total TikTok posts for the selected period"
      label="TikTok Posts"
      color="#000000"
    />
  )
}

const YoutubePostsChart = async ({
  startDate,
  endDate
}: {
  startDate: Date
  endDate: Date
}) => {
  const youtubePostsPerDay = await getYoutubePostsPerDay(startDate, endDate)
  const youtubePostsChartData = youtubePostsPerDay.map(({ date, count }) => ({
    date,
    count: Number(count)
  }))
  return (
    <PerDayChart
      data={youtubePostsChartData}
      className="col-span-12 md:col-span-6"
      title="Youtube Posts Per Day"
      description="Showing total Youtube posts for the selected period"
      label="Youtube Posts"
      color="#FF0000"
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
      className="col-span-12 md:col-span-6"
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
        <h1 className="text-4xl font-bold">All Time</h1>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-6">
        <Suspense fallback={<CardSkeleton />}>
          <RenderCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <UserCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <FeedbackCountCard />
        </Suspense>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-6">
        <Suspense fallback={<CardSkeleton />}>
          <YoutubeAccountsCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <TikTokAccountsCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <YoutubePostsCountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <TikTokPostsCountCard />
        </Suspense>
      </div>

      <div className="flex justify-between mb-4 flex-col md:flex-row">
        <h1 className="text-4xl font-bold">Selected Period</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <DateRangePicker />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <Suspense fallback={<ChartSkeleton className="col-span-12" />}>
          <RenderChart startDate={startDate} endDate={endDate} />
        </Suspense>
        <Suspense
          fallback={<ChartSkeleton className="col-span-12 md:col-span-6" />}
        >
          <UserChart startDate={startDate} endDate={endDate} />
        </Suspense>
        <Suspense
          fallback={<ChartSkeleton className="col-span-12 md:col-span-6" />}
        >
          <FeedbackChart startDate={startDate} endDate={endDate} />
        </Suspense>
        <Suspense
          fallback={<ChartSkeleton className="col-span-12 md:col-span-6" />}
        >
          <TikTokPostsChart startDate={startDate} endDate={endDate} />
        </Suspense>
        <Suspense
          fallback={<ChartSkeleton className="col-span-12 md:col-span-6" />}
        >
          <YoutubePostsChart startDate={startDate} endDate={endDate} />
        </Suspense>
        <Suspense fallback={<CardSkeleton className="col-span-12" />}>
          <MostRecentRendersCard />
        </Suspense>
      </div>
    </>
  )
}
