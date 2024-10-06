'use client'

import * as React from 'react'
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
}

export const PerDayChart: React.FC<PerDayChartProps> = ({
  className,
  data,
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

  console.log(data)
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              {config.count.label}
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.toLocaleString()}
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
