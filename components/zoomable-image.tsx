import { DetailedHTMLProps, ImgHTMLAttributes, useState } from 'react'

import { cn } from '@/lib/utils'

import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'

export default function ZoomableImage({
  src,
  alt,
  className
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const [isOpen, setIsOpen] = useState(false)

  if (!src) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <img
          src={src}
          alt={alt || ''}
          className={cn(className, 'hover:cursor-pointer')}
          width={100}
          height={100}
        />
      </DialogTrigger>
      <DialogContent
        className="max-w-7xl border-0 bg-transparent p-0"
        onInteractOutside={() => setIsOpen(false)}
      >
        <div className="relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-transparent shadow-md">
          <img
            src={src}
            alt={alt || ''}
            className="h-full w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
