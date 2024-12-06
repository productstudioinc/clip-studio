'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Marquee } from '@/components/magicui/marquee'

const allShowcases: ShowcaseCardProps[] = [
  {
    title: 'Splitscreen',
    videoSrc: 'https://assets.clip.studio/splitscreen_preview.webm'
  },
  {
    title: 'Twitter Thread',
    videoSrc: 'https://assets.clip.studio/twitter_preview.webm'
  },
  {
    title: 'Reddit Story',
    videoSrc: 'https://assets.clip.studio/reddit_preview.webm'
  }
]

export interface ShowcaseCardProps {
  title: string
  videoSrc: string
}

export function ShowcaseCard({ title, videoSrc }: ShowcaseCardProps) {
  return (
    <video
      src={videoSrc}
      width={200}
      height={300}
      autoPlay
      loop
      playsInline
      muted
      className="w-[200px] h-[300px] object-cover rounded-t-md"
      aria-description={title}
    />
  )
}
export function Showcase({
  className,
  reverse
}: {
  className?: string
  reverse?: boolean
}) {
  return (
    <div className={cn('overflow-hidden relative w-fit', className)}>
      <Marquee className="w-fit [--duration:40s]" vertical reverse={reverse}>
        {allShowcases.map((showcase, idx) => (
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
                delay: Math.random() * 0.5,
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
}

export function Welcome() {
  const router = useRouter()
  const searchParams = useSearchParams()
  function onContinue() {
    const params = new URLSearchParams(searchParams)
    params.set('step', '1')
    router.push(`/onboarding?${params.toString()}`)
  }

  return (
    <div className="flex flex-col h-screen w-screen relative items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid md:grid-cols-8 place-items-center w-full opacity-20">
        <Showcase className="h-full" />
        <Showcase className="h-full col-start-8" reverse />
      </div>

      <div className="space-y-8 relative px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center text-center space-y-6"
        >
          <motion.img
            src="/logo.svg"
            alt="Clip Studio"
            className="size-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="text-5xl font-bold tracking-tight"
          >
            Welcome to Clip Studio!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
            className="text-2xl text-muted-foreground"
          >
            Let&apos;s get started by creating your first video!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: 'easeOut' }}
          className="md:static fixed bottom-0 left-0 right-0 p-4 md:p-0 bg-background md:bg-transparent border-t border-border md:border-none"
        >
          <Button onClick={onContinue} className="w-full">
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
