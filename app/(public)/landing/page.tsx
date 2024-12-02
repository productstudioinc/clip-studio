import { HTMLAttributes } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Marquee } from '@/components/magicui/marquee'

const showcases = [
  {
    title: 'Splitscreen',
    videoSrc: 'https://assets.clip.studio/reddit_preview.webm'
  },
  {
    title: 'Reddit Story',
    videoSrc: 'https://assets.clip.studio/textmessage_preview.webm'
  },
  {
    title: 'Twitter Thread',
    videoSrc: 'https://assets.clip.studio/twitter_preview.webm'
  },
  {
    title: 'AI Generated Video',
    videoSrc: 'https://assets.clip.studio/splitscreen_preview.webm'
  }
]

function Showcase() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          Featured Creations
        </h2>
        <div className="relative">
          <Marquee className="py-4" pauseOnHover>
            {showcases.map((showcase, idx) => (
              <div
                key={idx}
                className={`h-[280px] sm:h-[380px] lg:h-[480px] w-[160px] sm:w-[200px] lg:w-[250px] rounded-3xl border-4 border-border bg-card shadow-xl`}
              >
                <video
                  src={showcase.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-background"></div>
        </div>
      </div>
    </section>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <Icons.logo className="w-6 h-6" />
          <span className="text-lg font-bold">clip.studio</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hidden md:block"
            >
              Pricing
            </Link>
          </nav>
          <Link
            href="/login"
            className={buttonVariants({ variant: 'rainbow' })}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

interface StatProps {
  value: string
  label: string
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-3xl font-bold text-foreground md:text-4xl">
        {value}
      </div>
      <div className="text-center text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function StatsSection() {
  return (
    <div className="border-t border-border bg-muted/50">
      <div className="container grid grid-cols-2 gap-8 py-12 md:grid-cols-4 md:py-16">
        <Stat value="240,909+" label="videos created with revid.ai" />
        <Stat
          value="68"
          label="Used in 68 countries for content in 32 languages"
        />
        <Stat value="1458" label="creators using revid.ai" />
        <Stat value="400+" label="creators reached 100k+ views" />
      </div>
    </div>
  )
}

interface AvatarCirclesProps extends HTMLAttributes<HTMLDivElement> {
  numPeople?: number
  avatarUrls: string[]
}

function AvatarCircles({
  numPeople,
  avatarUrls,
  className
}: AvatarCirclesProps) {
  return (
    <div className={cn('z-10 flex -space-x-4 rtl:space-x-reverse', className)}>
      {avatarUrls.map((url, index) => (
        <img
          key={index}
          className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white dark:border-gray-800 dark:bg-white dark:text-black">
        +{numPeople}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section id="hero" className="relative py-12 lg:py-24 xl:py-32">
      <div className="flex flex-col items-center max-w-7xl mx-auto">
        <div className="container flex flex-col justify-center space-y-8 max-w-[720px] mx-auto text-center mb-16">
          <div className="space-y-6">
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.1] tracking-tight">
              Create Viral Videos with 1 click
            </h1>
            <p className="text-muted-foreground text-[clamp(1rem,2vw,1.25rem)] leading-relaxed max-w-[90%] mx-auto">
              Turn your ideas into attention-grabbing videos with just a few
              clicks. Just enter your text and let clip.studio handle the rest.
            </p>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: 'rainbow', size: 'lg' }),
                'max-w-lg w-full text-lg'
              )}
            >
              Try for Free
            </Link>
            <p className="text-sm text-muted-foreground mt-2 sm:mt-auto">
              No credit card required
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-5 w-5 fill-current text-yellow-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <AvatarCircles
              className="justify-center"
              numPeople={1857}
              avatarUrls={[
                'https://avatars.githubusercontent.com/u/16860528',
                'https://avatars.githubusercontent.com/u/20110627',
                'https://avatars.githubusercontent.com/u/106103625',
                'https://avatars.githubusercontent.com/u/59228569',
                'https://avatars.githubusercontent.com/u/59442788',
                'https://avatars.githubusercontent.com/u/89768406'
              ]}
            />
            <p className="text-sm text-muted-foreground">
              Loved by 1,857+ creators
            </p>
          </div>
        </div>
        <div className="relative w-full mx-auto h-[400px] sm:h-[500px] lg:h-[600px] group overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {showcases.slice(0, 3).map((showcase, i) => (
              <div
                key={i}
                className={`absolute h-[280px] sm:h-[380px] lg:h-[480px] w-[160px] sm:w-[200px] lg:w-[230px] rounded-3xl border-4 border-border bg-card shadow-xl transition-all duration-300 ${
                  i === 0
                    ? '-rotate-12 -translate-x-1/2 group-hover:-rotate-[18deg] origin-bottom-left translate-y-[10%]'
                    : i === 2
                      ? 'rotate-12 translate-x-1/2 group-hover:rotate-[18deg] origin-bottom-right translate-y-[10%]'
                      : 'z-10 scale-110 group-hover:scale-125'
                }`}
              >
                <video
                  src={showcase.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <main>
        <Hero />
        <Showcase />
        {/* <StatsSection /> */}
      </main>
    </div>
  )
}
