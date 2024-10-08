import { Metadata } from 'next'
import Link from 'next/link'
import { MDXContent } from '@content-collections/mdx/react'
import { allChangelogs } from 'content-collections'
import { format, formatDistanceToNow } from 'date-fns'

import { constructMetadata } from '@/lib/seo-utils'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = constructMetadata({
  title: 'Changelog | Clip Studio'
})

export default function Changelog() {
  const changelogs = allChangelogs.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl mb-2 tracking-tight">Changelog</h1>
      <p className="text-sm text-muted-foreground mb-8">
        New updates and improvements to Clip Studio
      </p>
      <ul className="space-y-8">
        {changelogs.map((changelog, index) => (
          <li key={changelog.slug}>
            <div className="flex flex-col sm:flex-row items-start pb-6">
              <div className="w-full sm:w-3/4 order-2 sm:order-2">
                <div className="sm:hidden mb-2">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(changelog.updatedAt), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-[0.75rem] text-muted-foreground/50">
                    {formatDistanceToNow(new Date(changelog.updatedAt), {
                      addSuffix: true
                    })}
                  </p>
                </div>
                <Link
                  href={`/changelog/${changelog.slug}`}
                  className="block mb-2"
                >
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {changelog.title}
                  </h2>
                </Link>
                <div className="prose dark:prose-invert mt-4">
                  <MDXContent code={changelog.mdx} />
                </div>
              </div>
              <div className="w-full sm:w-1/4 pr-4 sm:sticky sm:top-0 order-1 sm:order-1 mb-2 sm:mb-0">
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {format(new Date(changelog.updatedAt), 'MMMM d, yyyy')}
                </p>
                <p className="text-[0.75rem] text-muted-foreground/50 hidden sm:block">
                  {formatDistanceToNow(new Date(changelog.updatedAt), {
                    addSuffix: true
                  })}
                </p>
              </div>
            </div>
            {index < changelogs.length - 1 && <Separator className="my-6" />}
          </li>
        ))}
      </ul>
    </div>
  )
}
