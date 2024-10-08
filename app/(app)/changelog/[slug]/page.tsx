import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXContent } from '@content-collections/mdx/react'
import { allChangelogs } from 'content-collections'

import { constructMetadata } from '@/lib/seo-utils'

interface ChangelogPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({
  params
}: ChangelogPageProps): Promise<Metadata> {
  const page = allChangelogs.find((post) => post.slug === params.slug)

  if (!page) {
    return constructMetadata({
      title: 'Not Found'
    })
  }

  return constructMetadata({
    title: `${page.title} | Changelog | Clip Studio`
  })
}

export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const page = allChangelogs.find((post) => post.slug === params.slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <article className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-4xl tracking-tight mb-2">{page.title}</h1>
          <time className="text-sm text-muted-foreground">
            {new Date(page.updatedAt).toLocaleDateString()}
          </time>
        </header>
        <div className="prose dark:prose-invert text-base sm:text-lg">
          <MDXContent code={page.mdx} />
        </div>
      </article>
    </div>
  )
}
