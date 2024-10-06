'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GridIcon, ListIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function ViewToggle() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'grid'

  return (
    <div className="flex items-center gap-1 border p-1 rounded-lg">
      <Link
        className={cn(
          buttonVariants({
            variant: view === 'grid' ? 'secondary' : 'ghost',
            size: 'sm'
          })
        )}
        href={{
          query: { ...Object.fromEntries(searchParams.entries()), view: 'grid' }
        }}
        passHref
      >
        <GridIcon className="h-4 w-4" />
      </Link>
      <Link
        className={cn(
          buttonVariants({
            variant: view === 'table' ? 'secondary' : 'ghost',
            size: 'sm'
          })
        )}
        href={{
          query: {
            ...Object.fromEntries(searchParams.entries()),
            view: 'table'
          }
        }}
        passHref
      >
        <ListIcon className="h-4 w-4" />
      </Link>
    </div>
  )
}
