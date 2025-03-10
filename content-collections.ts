import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'

const pages = defineCollection({
  name: 'pages',
  directory: 'content/pages',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    updatedAt: z.string().optional(),
    slug: z.string().optional()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document)
    return {
      ...document,
      mdx,
      slug: document.slug || document.title.toLowerCase().replace(/ /g, '-'),
      updatedAt: document.updatedAt || new Date().toISOString()
    }
  }
})

const changelog = defineCollection({
  name: 'changelog',
  directory: 'content/changelog',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    subtitle: z.string().optional(),
    updatedAt: z.string().optional(),
    slug: z.string().optional(),
    category: z.string().optional()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document)
    return {
      ...document,
      mdx,
      slug: document.slug || document.title.toLowerCase().replace(/ /g, '-'),
      updatedAt: document.updatedAt || new Date().toISOString()
    }
  }
})

export default defineConfig({
  collections: [pages, changelog]
})
