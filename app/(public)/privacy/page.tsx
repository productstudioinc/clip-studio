import { Metadata } from 'next'
import { allPages } from '@/.content-collections/generated'

import { constructMetadata } from '@/lib/seo-utils'
import LegalPage from '@/components/legal-page'

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy | Clip Studio'
})

export default function Privacy() {
  const post = allPages.find((post) => post.slug === 'privacy')!
  return <LegalPage page={post} />
}
