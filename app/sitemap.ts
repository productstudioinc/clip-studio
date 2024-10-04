import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { allPages } from 'content-collections'

export default function sitemap(): MetadataRoute.Sitemap {
  const headersList = headers()
  let domain = headersList.get('host') as string
  let protocol = 'https'

  return [
    {
      url: `${protocol}://${domain}`,
      lastModified: new Date()
    },
    ...allPages.map((post) => ({
      url: `${protocol}://${domain}/${post.slug}`,
      lastModified: new Date()
    }))
  ]
}
