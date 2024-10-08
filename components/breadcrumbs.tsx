'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Breadcrumbs() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex overflow-x-auto">
      <ol className="flex items-center space-x-2 whitespace-nowrap">
        <li className="flex-shrink-0">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            home
          </Link>
        </li>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join('/')}`
          const isLast = index === paths.length - 1
          return (
            <li key={path} className="flex items-center flex-shrink-0">
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {isLast ? (
                <span className="ml-2 text-sm font-medium text-foreground">
                  {path}
                </span>
              ) : (
                <Link
                  href={href}
                  className={cn(
                    'ml-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
                  )}
                >
                  {path}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
