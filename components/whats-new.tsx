'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MDXContent } from '@content-collections/mdx/react'
import { ArrowRightIcon, BellIcon } from '@radix-ui/react-icons'
import { allChangelogs } from 'content-collections'
import { format, formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function WhatsNew({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const changelogs = allChangelogs.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn('text-sm font-medium group flex gap-2', className)}
          variant="ghost"
        >
          <BellIcon className="size-4" />
          <span className="text-sm font-medium">Changelog</span>
          <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-200 ease-out" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] bg-popover p-0 rounded-xl overflow-hidden"
        side="left"
      >
        <Link
          href="/changelog"
          className="block w-full"
          onClick={handleLinkClick}
        >
          <div className="flex items-center justify-between px-4 py-2 group hover:bg-accent transition-colors duration-200">
            <h2 className="text-lg font-semibold">Changelog</h2>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">View all</span>
              <ArrowRightIcon className="size-4 ml-2 group-hover:translate-x-1 transition-all duration-200 ease-out" />
            </div>
          </div>
        </Link>
        <Separator />
        <ScrollArea className="h-[350px]">
          <div className="divide-y">
            {changelogs.map((changelog, index) => (
              <Link
                key={index}
                href={`/changelog/${changelog.slug}`}
                className="block group hover:bg-accent transition-colors duration-200 p-4"
                onClick={handleLinkClick}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="font-semibold">{changelog.subtitle}</h3>
                    <ArrowRightIcon className="size-4 ml-2 group-hover:translate-x-1 transition-all duration-200 ease-out opacity-0 group-hover:opacity-100" />
                  </div>
                  {index === 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                  <MDXContent code={changelog.mdx} />
                </div>
                <time className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <p>{format(new Date(changelog.updatedAt), 'MMMM d, yyyy')}</p>
                  <span>·</span>
                  <p className="text-muted-foreground/50">
                    {formatDistanceToNow(new Date(changelog.updatedAt), {
                      addSuffix: true
                    })}
                  </p>
                </time>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
