import { MDXContent } from '@content-collections/mdx/react'
import { Page } from 'content-collections'

export default function ChangeLogPage({ page }: { page: Page }) {
  return (
    <>
      <div className="flex flex-col text-left pb-10 pt-10 container prose dark:prose-invert">
        <MDXContent code={page.mdx} />{' '}
      </div>
    </>
  )
}
