import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRenderById } from '@/actions/db/admin-queries'
import { formatDistanceToNow } from 'date-fns'
import { Download } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default async function RenderPage({
  params
}: {
  params: { id: string }
}) {
  const render = await getRenderById(params.id)

  if (!render) {
    notFound()
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-primary">
            {render.templateName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(render.createdAt, { addSuffix: true })}
          </p>
        </div>

        <div className="aspect-[9/16] w-full max-w-xl mx-auto rounded-lg overflow-hidden border border-border">
          <video
            src={render.videoUrl || ''}
            controls
            playsInline
            className="w-full h-full"
          />
        </div>

        <div className="flex justify-center">
          <Link
            href={render.videoUrl || '#'}
            target="_blank"
            className={cn(
              buttonVariants({
                variant: 'secondary',
                size: 'lg'
              }),
              'w-full max-w-sm'
            )}
          >
            <Download className="mr-2 h-5 w-5" /> Download Video
          </Link>
        </div>
      </div>
    </div>
  )
}
