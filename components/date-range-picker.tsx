'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format, subDays, subMonths } from 'date-fns'
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
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

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
      return {
        from: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 29
        ),
        to: today
      }
    }
  })

  const [preset, setPreset] = React.useState<string>(() => {
    return searchParams.get('preset') || 'last30days'
  })

  const updateUrlParams = (newDate: DateRange, newPreset: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('from', format(newDate.from!, 'yyyy-MM-dd'))
    params.set('to', format(newDate.to!, 'yyyy-MM-dd'))
    params.set('preset', newPreset)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (newDate?.from && newDate?.to) {
      setPreset('custom')
      updateUrlParams(newDate, 'custom')
    }
  }

  const handlePresetChange = (value: string) => {
    const today = new Date()
    let newFrom: Date
    let newTo: Date

    switch (value) {
      case 'today':
        newFrom = today
        newTo = today
        break
      case 'yesterday':
        newFrom = subDays(today, 1)
        newTo = subDays(today, 1)
        break
      case 'last7days':
        newFrom = subDays(today, 6)
        newTo = today
        break
      case 'last30days':
        newFrom = subDays(today, 29)
        newTo = today
        break
      case 'last90days':
        newFrom = subDays(today, 89)
        newTo = today
        break
      case 'last12months':
        newFrom = subMonths(today, 11)
        newTo = today
        break
      default:
        return
    }

    const newDate = { from: newFrom, to: newTo }
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
          <SelectItem value="custom">Custom</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="last90days">Last 90 days</SelectItem>
          <SelectItem value="last12months">Last 12 months</SelectItem>
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
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
