'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CalendarIcon } from '@radix-ui/react-icons'
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths
} from 'date-fns'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Define an enum for date presets
enum DatePreset {
  AllTime = 'alltime',
  Custom = 'custom',
  Today = 'today',
  Yesterday = 'yesterday',
  ThisWeek = 'thisWeek',
  LastWeek = 'lastWeek',
  ThisMonth = 'thisMonth',
  LastMonth = 'lastMonth',
  Last7Days = 'last7days',
  Last14Days = 'last14days',
  Last30Days = 'last30days',
  Last90Days = 'last90days',
  Last12Months = 'last12months'
}

// Define a map for date calculations
const dateCalculations: Record<
  DatePreset,
  (today: Date) => { from: Date; to: Date }
> = {
  [DatePreset.AllTime]: (today) => ({
    from: new Date('2024-08-01'),
    to: today
  }),
  [DatePreset.Custom]: (today) => ({ from: today, to: today }), // This will be overwritten by custom selection
  [DatePreset.Today]: (today) => ({ from: today, to: today }),
  [DatePreset.Yesterday]: (today) => {
    const yesterday = subDays(today, 1)
    return { from: yesterday, to: yesterday }
  },
  [DatePreset.ThisWeek]: (today) => ({
    from: startOfWeek(today, { weekStartsOn: 0 }),
    to: endOfWeek(today, { weekStartsOn: 0 })
  }),
  [DatePreset.LastWeek]: (today) => {
    const lastWeek = subDays(today, 7)
    return {
      from: startOfWeek(lastWeek, { weekStartsOn: 0 }),
      to: endOfWeek(lastWeek, { weekStartsOn: 0 })
    }
  },
  [DatePreset.ThisMonth]: (today) => ({
    from: startOfMonth(today),
    to: endOfMonth(today)
  }),
  [DatePreset.LastMonth]: (today) => {
    const lastMonth = subMonths(today, 1)
    return {
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth)
    }
  },
  [DatePreset.Last7Days]: (today) => ({ from: subDays(today, 6), to: today }),
  [DatePreset.Last14Days]: (today) => ({ from: subDays(today, 13), to: today }),
  [DatePreset.Last30Days]: (today) => ({ from: subDays(today, 29), to: today }),
  [DatePreset.Last90Days]: (today) => ({ from: subDays(today, 89), to: today }),
  [DatePreset.Last12Months]: (today) => ({
    from: subMonths(today, 11),
    to: today
  })
}

export function DateRangePicker({
  className
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    if (fromParam && toParam) {
      return {
        from: new Date(fromParam),
        to: new Date(new Date(toParam).setHours(23, 59, 59, 999))
      }
    } else {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return dateCalculations[DatePreset.Last14Days](today)
    }
  })

  const [preset, setPreset] = React.useState<DatePreset>(() => {
    return (searchParams.get('preset') as DatePreset) || DatePreset.Last14Days
  })

  React.useEffect(() => {
    if (
      !searchParams.get('from') ||
      !searchParams.get('to') ||
      !searchParams.get('preset')
    ) {
      updateUrlParams(date!, preset)
    }
  }, [])

  const updateUrlParams = (newDate: DateRange, newPreset: DatePreset) => {
    const params = new URLSearchParams(searchParams)
    params.set('from', format(newDate.from!, 'yyyy-MM-dd'))
    params.set('to', format(newDate.to!, 'yyyy-MM-dd'))
    params.set('preset', newPreset)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (newDate?.from && newDate?.to) {
      setPreset(DatePreset.Custom)
      updateUrlParams(newDate, DatePreset.Custom)
    }
  }

  const handlePresetChange = (value: DatePreset) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const newDate = dateCalculations[value](today)
    setDate(newDate)
    setPreset(value)
    updateUrlParams(newDate, value)
  }

  return (
    <div className={cn('flex gap-2 flex-row', className)}>
      <Select onValueChange={handlePresetChange} value={preset}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select preset" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alltime">All Time</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
          <SelectSeparator />
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last14days">Last 14 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="last90days">Last 90 days</SelectItem>
          <SelectItem value="last12months">Last 12 months</SelectItem>
          <SelectSeparator />
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectSeparator />
          <SelectItem value="thisWeek">This Week</SelectItem>
          <SelectItem value="lastWeek">Last Week</SelectItem>
          <SelectSeparator />
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="lastMonth">Last Month</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'max-w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            weekStartsOn={0}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
