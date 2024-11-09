'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Marquee from '@/components/magicui/marquee'

const ease = [0.16, 1, 0.3, 1]

type Link = {
  text: string
  url: string
}

const links: Link[] = [
  { text: 'terms', url: '/terms' },
  { text: 'privacy', url: '/privacy' }
]

const HeroPill = () => (
  <motion.a
    href="/changelog/2024-11-03-twitter-thread-template-launch"
    className="flex w-auto items-center space-x-2 rounded-full bg-primary/20 px-2 py-1 ring-1 ring-accent whitespace-pre"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease }}
  >
    <div className="w-fit rounded-full bg-accent px-2 py-0.5 text-center text-xs font-medium text-primary sm:text-sm">
      📣 Announcement
    </div>
    <p className="text-xs font-medium text-primary sm:text-sm">
      Introducing our Twitter template
    </p>
    <svg
      width="12"
      height="12"
      className="ml-1"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.78141 5.33312L5.20541 1.75712L6.14808 0.814453L11.3334 5.99979L6.14808 11.1851L5.20541 10.2425L8.78141 6.66645H0.666748V5.33312H8.78141Z"
        fill="hsl(var(--primary))"
      />
    </svg>
  </motion.a>
)

const HeroTitles = () => (
  <div className="flex w-full max-w-2xl flex-col space-y-4 overflow-hidden pt-8">
    <motion.h1
      className="text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl"
      initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{
        duration: 1,
        ease,
        staggerChildren: 0.2
      }}
    >
      {['Create', 'viral', 'short-form', 'videos', 'with AI'].map(
        (text, index) => (
          <motion.span
            key={index}
            className="inline-block px-2 tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: index * 0.2,
              ease
            }}
          >
            {text}
          </motion.span>
        )
      )}
    </motion.h1>
    <motion.p
      className="mx-auto max-w-xl text-center text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-9"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.6,
        duration: 0.8,
        ease
      }}
    >
      Create and publish short-form videos with AI in just a few clicks
    </motion.p>
  </div>
)

const HeroCTA = () => (
  <>
    <motion.div
      className="mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:mt-10 sm:flex-row sm:space-x-4 sm:space-y-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease }}
    >
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: 'default' }),
          'w-full sm:w-auto text-background flex gap-2'
        )}
      >
        Get started for free
      </Link>
    </motion.div>
    <motion.p
      className="mt-5 text-sm text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0, duration: 0.8 }}
    >
      Make your first clip in 30 seconds. No credit card required.
    </motion.p>
  </>
)

// const HeroImage = () => (
// 	<motion.div
// 		className="relative mx-auto mt-16 flex w-full items-center justify-center sm:mt-16"
// 		initial={{ opacity: 0, y: 50 }}
// 		animate={{ opacity: 1, y: 0 }}
// 		transition={{ delay: 1.2, duration: 1, ease }}
// 	>
// 		<HeroVideoDialog
// 			animationStyle="from-center"
// 			videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
// 			thumbnailSrc="/dashboard.png"
// 			thumbnailAlt="Hero Video"
// 			className="border rounded-lg shadow-lg max-w-screen-lg mt-16"
// 		/>
// 	</motion.div>
// );
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
    <div className="relative flex-shrink-0 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
      <video
        src={videoSrc}
        width={200}
        height={300}
        autoPlay
        loop
        playsInline
        muted
        className="w-[200px] h-[300px] object-cover rounded-t-md"
      />
      <div className="w-full p-2 text-center">
        <div className="inline-flex cursor-pointer items-center justify-center gap-1 duration-200 hover:text-neutral-700 dark:hover:text-neutral-200 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {title}
        </div>
      </div>
    </div>
  )
}

export function Showcase() {
  return (
    <section id="showcase" className="container py-14">
      <div className="relative flex flex-col">
        <Marquee className="max-w-screen [--duration:40s]">
          {allShowcases.map((showcase, idx) => (
            <ShowcaseCard key={idx} {...showcase} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/12 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 h-full  w-1/12 bg-gradient-to-l from-background"></div>
      </div>
    </section>
  )
}

export default function Hero() {
  return (
    <main className="relative container mx-auto gap-4 flex flex-col w-full overflow-hidden pt-8">
      <section id="hero">
        <div className="flex w-full flex-col items-center justify-start">
          <HeroPill />
          <HeroTitles />
          <HeroCTA />
          {/* <HeroImage /> */}
          <Showcase />
        </div>
      </section>
      <footer>
        <div className="flex items-center justify-between gap-x-5">
          <div className="flex items-center gap-x-2">
            <Image
              className="h-8 w-8 rounded-full"
              src="/logo.svg"
              alt="Company Logo"
              width={8}
              height={8}
            />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Clip Studio
            </h2>
          </div>

          <ul className="flex items-center justify-center gap-x-10">
            {links.map((link, index) => (
              <li
                key={index}
                className="text-[15px]/normaltext-neutral-400 transition-all duration-100 ease-linear hover:text-neutral-900 hover:underline hover:underline-offset-4 dark:text-neutral-400 hover:dark:text-neutral-100"
              >
                <Link href={link.url}>{link.text}</Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </main>
  )
}
