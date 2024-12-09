'use client'

import { memo, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

// Memoized video component to prevent unnecessary re-renders
export const ShowcaseVideo = memo(function ShowcaseVideo({
  src,
  className
}: {
  src: string
  className?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Preload video
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={cn('h-full w-full rounded-xl object-cover', className)}
    />
  )
})
