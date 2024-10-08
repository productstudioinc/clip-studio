'use client'

import { TemplateSchema } from '@/stores/templatestore'
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

export const description =
  'A stacked bar chart showing render counts per template'

interface DataPoint {
  date: string
  [key: string]: number | string
}

interface RenderChartProps {
  data: DataPoint[]
  previousData: DataPoint[]
  className?: string
}

const chartConfig: ChartConfig = Object.fromEntries(
  TemplateSchema.options.map((template, index) => [
    template,
    {
      label: template,
      color: `hsl(var(--chart-${index + 1}))`
    }
  ])
)

export function RendersGroupedByTemplateChart({
  data,
  previousData,
  className
}: RenderChartProps) {
  const total = data.reduce(
    (acc, curr) =>
      acc +
      Object.values(curr)
        .filter((v) => typeof v === 'number')
        .reduce((sum, v) => sum + (v as number), 0),
    0
  )
  const previousTotal = previousData.reduce(
    (acc, curr) =>
      acc +
      Object.values(curr)
        .filter((v) => typeof v === 'number')
        .reduce((sum, v) => sum + (v as number), 0),
    0
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

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-row justify-between items-start gap-1 px-6 pt-6">
          <div>
            <CardTitle>Render Count by Template</CardTitle>
            <CardDescription>
              Showing total renders for the selected period
            </CardDescription>
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
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
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
                  className="w-40"
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
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(chartConfig).map((key, index, array) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={`var(--color-${key})`}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
