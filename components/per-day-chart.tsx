'use client'

import * as React from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

interface PerDayChartProps {
  title: string
  description: string
  className?: string
  data: { date: string; count: number }[]
  label: string
  color: string
  previousData: { date: string; count: number }[]
}

export const PerDayChart: React.FC<PerDayChartProps> = ({
  className,
  data,
  previousData,
  title,
  description,
  label,
  color = 'hsl(var(--chart-1))'
}) => {
  const config = {
    data: {
      label: label
    },
    count: {
      label: 'Count',
      color: color
    }
  } satisfies ChartConfig

  const total = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.count, 0),
    [data]
  )

  const previousTotal = React.useMemo(
    () => previousData.reduce((acc, curr) => acc + curr.count, 0),
    [previousData]
  )

  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }
    return ((current - previous) / previous) * 100
  }

  const percentChange = calculatePercentChange(total, previousTotal)
  const isPositive = percentChange > 0
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500'

  console.log(data)
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-row justify-between items-start gap-1 px-6 pt-6">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${changeColor}`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {new Intl.NumberFormat(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(percentChange / 100)}
          </div>
        </div>
        <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold leading-none">
              {total.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              from {previousTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value + 'T00:00:00Z')
                return date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC'
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="data"
                  labelFormatter={(value) => {
                    const date = new Date(value + 'T00:00:00Z')
                    return date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC'
                    })
                  }}
                />
              }
            />
            <Bar dataKey="count" fill={`var(--color-count)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
