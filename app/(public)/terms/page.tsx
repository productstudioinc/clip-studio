import { Metadata } from 'next'
import { allPages } from '@/.content-collections/generated'

import { constructMetadata } from '@/lib/seo-utils'
import LegalPage from '@/components/legal-page'

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Service | Clip Studio'
})

export default function Terms() {
  const post = allPages.find((post) => post.slug === 'terms')!
  return <LegalPage page={post} />
}
