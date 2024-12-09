'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { Marquee } from '@/components/magicui/marquee'

const showcases = [
  {
    title: 'Reddit Story',
    videoSrc: 'https://assets.clip.studio/reddit_preview.webm'
  },
  {
    title: 'Text Message Story',
    videoSrc: 'https://assets.clip.studio/textmessage_preview.webm'
  },
  {
    title: 'Twitter Thread',
    videoSrc: 'https://assets.clip.studio/twitter_preview.webm'
  },
  {
    title: 'Splitscreen',
    videoSrc: 'https://assets.clip.studio/splitscreen_preview.webm'
  },
  {
    title: 'AI Video',
    videoSrc: 'https://assets.clip.studio/aivideo_preview.webm'
  }
]

export interface ShowcaseCardProps {
  title: string
  videoSrc: string
}

export function ShowcaseCard({ title, videoSrc }: ShowcaseCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play()
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.2 } // Start playing when 20% visible
    )

    observer.observe(video)

    return () => {
      observer.unobserve(video)
      observer.disconnect()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      width={200}
      height={300}
      loop
      playsInline
      muted
      preload="none"
      className="w-[200px] h-[300px] object-cover rounded-t-md"
      aria-description={title}
    />
  )
}

export const Showcase = React.memo(function Showcase({
  className,
  reverse
}: {
  className?: string
  reverse?: boolean
}) {
  const shuffledShowcases = [...showcases].sort(() => Math.random() - 0.5) // Shuffle the showcases array
  return (
    <div className={cn('overflow-hidden relative w-fit', className)}>
      <Marquee vertical reverse={reverse}>
        {shuffledShowcases.map((showcase, idx) => (
          <motion.div
            key={idx}
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            transition={{
              opacity: {
                delay: Math.random() * 0.7, // Adjusted delay for randomness
                duration: 0.8,
                ease: 'easeOut'
              }
            }}
          >
            <ShowcaseCard {...showcase} />
          </motion.div>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background to-transparent"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  )
})

export default function VideoBackground() {
  return (
    <div className="absolute inset-0 grid place-items-center w-full opacity-10 max-h-[80vh] grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 pointer-events-none select-none">
      {Array.from({ length: 8 }).map((_, index) => (
        <Showcase key={index} className="h-full" reverse={index % 2 === 1} />
      ))}
    </div>
  )
}
