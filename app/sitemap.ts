import { MetadataRoute } from 'next'
import { headers, type UnsafeUnwrappedHeaders } from 'next/headers';
import { allChangelogs, allPages } from 'content-collections'

export default function sitemap(): MetadataRoute.Sitemap {
  const headersList = (headers() as unknown as UnsafeUnwrappedHeaders)
  let domain = headersList.get('host') as string
  let protocol = 'https'

  return [
    {
      url: `${protocol}://${domain}`,
      lastModified: new Date()
    },
    {
      url: `${protocol}://${domain}/pricing`,
      lastModified: new Date()
    },
    {
      url: `${protocol}://${domain}/changelog`,
      lastModified: new Date()
    },
    ...allChangelogs.map((post) => ({
      url: `${protocol}://${domain}/changelog/${post.slug}`,
      lastModified: new Date()
    })),
    ...allPages.map((post) => ({
      url: `${protocol}://${domain}/${post.slug}`,
      lastModified: new Date()
    }))
  ]
}
