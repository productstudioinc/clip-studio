import Link from 'next/link'
import { RenderHistoryForAdmin } from '@/actions/db/admin-queries'
import { SelectPastRenders } from '@/db/schema'
import { formatDistanceToNow } from 'date-fns'
import { Download } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface RendersGridProps {
  renderHistory: RenderHistoryForAdmin[] | SelectPastRenders[]
}

export async function RendersGrid({ renderHistory }: RendersGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {renderHistory.map((render) => (
          <div key={render.id} className="border rounded-lg overflow-hidden">
            <div className="aspect-[9/16] mb-2 relative">
              <video
                src={render.videoUrl || ''}
                controls
                playsInline
                className="w-full h-full"
              />
            </div>
            <div className="pb-4 px-4">
              <h3 className="font-semibold mb-1">{render.templateName}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {formatDistanceToNow(render.createdAt, { addSuffix: true })}
              </p>
              {'userEmail' in render && render.userEmail && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {render.userEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {render.userId}
                  </p>
                </>
              )}

              <div className="flex flex-col gap-2">
                <Link
                  href={render.videoUrl || '#'}
                  target="_blank"
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                      size: 'sm'
                    }),
                    'w-full'
                  )}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Link>
                <Link
                  href={`/admin/renders/${render.id}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'w-full'
                  )}
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
