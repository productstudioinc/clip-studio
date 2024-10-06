'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search as SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()
  const [debouncedTerm, setDebouncedTerm] = useState('')

  const currentQuery = useMemo(
    () => searchParams.get('query') || '',
    [searchParams]
  )

  const handleSearch = useCallback(
    debounce((term: string) => {
      if (term !== currentQuery) {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1')
        if (term) {
          params.set('query', term)
        } else {
          params.delete('query')
        }
        replace(`${pathname}?${params.toString()}`)
      }
    }, 200),
    [searchParams, pathname, replace, currentQuery]
  )

  useEffect(() => {
    handleSearch(debouncedTerm)
  }, [debouncedTerm, handleSearch])

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8"
        onChange={(e) => setDebouncedTerm(e.target.value)}
        defaultValue={currentQuery}
      />
    </div>
  )
}
