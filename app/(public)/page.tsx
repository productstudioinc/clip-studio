import { HTMLAttributes } from 'react'
import Link from 'next/link'
import { List } from 'lucide-react'

import { siteConfig } from '@/lib/config'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { Headline } from '@/components/headline'
import { Icons } from '@/components/icons'
import { Marquee } from '@/components/magicui/marquee'
import NumberTicker from '@/components/magicui/number-ticker'
import Section from '@/components/section'
import StripePopup from '@/components/stripe-popup'

function CTA() {
  return (
    <Section
      id="cta"
      title="Ready to get started?"
      subtitle="Start getting views today."
      className="container"
    >
      <Rainbow />
      <div className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
        <Link
          href="/home"
          className={cn(
            buttonVariants({ variant: 'rainbow' }),
            'w-full sm:w-auto text-background flex gap-2'
          )}
        >
          <Icons.logo className="h-6 w-6" />
          Get started for free
        </Link>
      </div>
    </Section>
  )
}

function FAQ() {
  return (
    <Section title="FAQ" subtitle="Frequently asked questions">
      <div className="mx-auto my-12 md:max-w-screen-sm text-left">
        <Accordion
          type="single"
          collapsible
          className="flex w-full flex-col items-center justify-center space-y-2"
        >
          {siteConfig.faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={faq.question}
              className="w-full border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 text-left">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <h4 className="mb-12 text-center text-sm font-medium tracking-tight text-foreground/80">
        Still have questions? Email us at{' '}
        <a href={`mailto:${siteConfig.links.email}`} className="underline">
          {siteConfig.links.email}
        </a>
      </h4>
    </Section>
  )
}

function HeroPill() {
  return (
    <Link
      href="/changelog/2024-11-03-twitter-thread-template-launch"
      className="flex w-fit mx-auto items-center space-x-2 rounded-full bg-primary/20 px-2 py-1 ring-1 ring-accent whitespace-pre"
    >
      <div className="w-fit rounded-full bg-accent px-2 py-0.5 text-center text-xs font-medium text-primary sm:text-sm hidden md:block">
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
    </Link>
  )
}

const features = [
  {
    id: 'feature-template',
    header: 'Step 1',
    name: 'Choose Your Template',
    description:
      'Pick from our library of proven video templates - from viral TikTok styles to professional LinkedIn formats. Each template is designed to maximize engagement on your target platform.',
    // icon: Icons.template,
    video: 'https://assets.clip.studio/reddit_preview.webm',
    cta: 'Get Started',
    href: '/home',
    reverse: false
  },
  {
    id: 'feature-customize',
    header: 'Step 2',
    name: 'Customize Your Video',
    description:
      'Add your content, tweak the style, and make it yours. Our AI helps you generate engaging captions, pick the perfect music, and optimize every element for maximum impact.',
    icon: List,
    video: 'https://assets.clip.studio/textmessage_preview.webm',
    cta: 'Get Started',
    href: '/home',
    reverse: true
  },
  {
    id: 'feature-schedule',
    header: 'Step 3',
    name: 'Schedule & Share',
    description:
      'Schedule your video to post at the perfect time or publish instantly to multiple platforms. Track performance and optimize your content strategy with our analytics.',
    // icon: Icons.calendar,
    video: 'https://assets.clip.studio/splitscreen_preview.webm',
    cta: 'Get Started',
    href: '/home',
    reverse: false,
    icons: (
      <div className="flex gap-4 items-center mt-4">
        <img
          src="/instagram.png"
          alt="Instagram"
          width={32}
          height={32}
          className="transform -rotate-15"
        />
        <img
          src="/tiktok.png"
          alt="TikTok"
          width={40}
          height={40}
          className="transform rotate-10"
        />
        <img
          src="/youtube.png"
          alt="YouTube"
          width={32}
          height={32}
          className="transform -rotate-5"
        />
      </div>
    )
  }
]

function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      // title="How It Works"
      className="container max-w-screen-lg"
      subtitle="How It Works"
      description="Turn your ideas into viral videos with just a few clicks. Just enter your text and let clip.studio handle the rest."
    >
      {features.map((feature) => (
        <div id={feature.id} key={feature.id}>
          <div className="mx-auto py-6 sm:py-12">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              <div
                className={cn('m-auto lg:col-span-3', {
                  'lg:order-last': feature.reverse
                })}
              >
                <h2 className="text-lg font-semibold leading-7 text-primary">
                  {feature.header}
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {feature.name}
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {feature.description}
                </p>
                {feature.icons}
                <Link
                  className={cn(
                    buttonVariants({
                      variant: 'rainbow',
                      size: 'lg'
                    }),
                    'mt-8'
                  )}
                  href={feature.href}
                >
                  {feature.cta}
                </Link>
              </div>
              <video
                src={feature.video}
                autoPlay
                loop
                muted
                playsInline
                className="rounded-xl border border-border m-auto lg:col-span-2 shadow-2xl bg-card"
              />
            </div>
          </div>
        </div>
      ))}
    </Section>
  )
}

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
  }
]

function Showcase() {
  return (
    <Section
      id="showcase"
      className="container"
      subtitle="Showcase"
      description="Check out some of our featured creations."
    >
      <div className="relative flex flex-col">
        <Marquee className="py-4" pauseOnHover>
          {showcases.map((showcase, idx) => (
            <div
              key={idx}
              className={`h-[280px] sm:h-[380px] lg:h-[480px] w-[160px] sm:w-[200px] lg:w-[250px] rounded-xl border-2 border-border bg-card shadow-xl`}
            >
              <video
                src={showcase.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-background"></div>
      </div>
    </Section>
  )
}

interface StatProps {
  value: string
  label: string
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-2xl font-bold text-foreground md:text-4xl whitespace-nowrap">
        <NumberTicker value={Number(value)} />+
      </div>
      <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function StatsSection() {
  return (
    <Section
      id="stats"
      // subtitle="Stats"
      description="We've helped generate over 1.3 million views and supported 1,400+ creators."
    >
      <div className="container max-w-screen-lg grid grid-cols-2 gap-4 md:gap-8 py-8 md:py-16 md:grid-cols-4">
        <Stat value="1305129" label="total views generated" />
        <Stat value="1404" label="active creators" />
        <Stat value="1204" label="videos generated" />
        <Stat value="68" label="countries creating content" />
      </div>
    </Section>
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
          className="h-10 w-10 rounded-full border-2 border-background bg-background"
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-center text-xs font-medium text-primary-foreground">
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
            <HeroPill />
            <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-bold leading-[1.1] tracking-tight text-balance">
              <Headline />
            </h1>

            <p className="text-muted-foreground text-[clamp(0.9rem,2vw,1.25rem)] leading-relaxed max-w-[90%] mx-auto">
              Turn your ideas into attention-grabbing videos with just a few
              clicks. Just enter your text and let clip.studio AI handle the
              rest.
            </p>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center">
            <Link
              href="/home"
              className={cn(
                buttonVariants({ variant: 'rainbow', size: 'lg' }),
                'max-w-lg w-full text-lg'
              )}
            >
              Get Started
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

function SuccessStories() {
  return (
    <Section
      id="success-stories"
      subtitle="Success Stories"
      description="Join thousands of creators who've grown their audience with clip.studio"
    >
      <div className="mx-auto max-w-3xl flex flex-col gap-4">
        <div className="relative aspect-video w-full rounded-xl border shadow-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/1Yc7Mx2vWDc"
            title="Creator Testimonial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0"
          />
        </div>
      </div>
    </Section>
  )
}

function Rainbow() {
  return (
    <div className="absolute pointer-events-none inset-0 top-0 h-20 w-full before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[80%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(4*1rem))] before:opacity-20" />
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <StatsSection />
      <SuccessStories />
      <HowItWorks />
      <Showcase />
      <FAQ />
      <CTA />

      {/* Rainbow and Stripe Popup are only shown on the home page */}
      <Rainbow />
      <StripePopup />
    </>
  )
}
