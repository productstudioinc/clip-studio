'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackMetaEvent } from '@/actions/meta'
import { checkoutWithStripe } from '@/actions/stripe/server'
import { usePricing } from '@/contexts/pricing-context'
import { Price } from '@/db/schema'
import { getStripe } from '@/utils/stripe/client'
import { CheckIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'
import { Loader, XIcon } from 'lucide-react'
import posthog from 'posthog-js'
import { toast } from 'sonner'
import { uuidv7 } from 'uuidv7'
import { z } from 'zod'

import { POSTHOG_EVENTS } from '@/lib/posthog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useFacebookPixel } from '@/components/meta/pixel-provider'

type Interval = 'month' | 'year'

const toHumanPrice = (price: number | null, decimals: number = 2) => {
  if (price === null) return 'N/A'
  return Number(price / 100).toFixed(decimals)
}

interface PricingCardProps {
  className?: string
  product?: any
  interval: Interval
  isLoading: boolean
  id: string | null
  subscription: string | null
  onSubscribeClick: (
    price: Partial<z.infer<typeof Price>>,
    productId: string
  ) => void
  isFree?: boolean
  router: any
}

function PricingCard({
  className,
  product,
  interval,
  isLoading,
  id,
  subscription,
  onSubscribeClick,
  isFree,
  router
}: PricingCardProps) {
  if (isFree) {
    return (
      <div
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-2xl border p-6 text-black dark:text-white mx-auto max-w-[350px] scale-95',
          className
        )}
      >
        <div className="flex flex-col items-start mb-2">
          <h2 className="text-xl font-semibold leading-7">Free</h2>
          <p className="mt-1 h-10 text-sm leading-5 text-black/70 dark:text-white/70">
            Get started with basic features
          </p>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <span className="text-4xl font-bold text-black dark:text-white">
            $0
            <span className="ml-2 text-sm font-normal text-gray-500">
              / month
            </span>
          </span>
          <span className="block h-5 text-sm font-normal text-gray-500">
            &nbsp;
          </span>
        </div>

        <Button
          className={cn(
            'group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter mb-4',
            'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2'
          )}
          variant="outline"
          onClick={() => {
            router.push('/home')
          }}
        >
          <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
          <p>Register</p>
        </Button>

        <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0 mb-4" />

        <ul className="flex flex-col gap-2 font-normal">
          <li className="flex items-center gap-3 text-sm font-medium text-black dark:text-white">
            <CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-600 p-[2px] text-white dark:text-white" />
            <span className="flex">20 credits</span>
          </li>
          <li className="flex items-center gap-3 text-sm font-medium text-black dark:text-white">
            <XIcon className="h-5 w-5 shrink-0 rounded-full bg-red-600 p-[2px] text-white dark:text-white" />
            <span className="flex">No connected accounts</span>
          </li>
        </ul>
      </div>
    )
  }

  const monthlyPrice = product.prices.find((p: any) => p.interval === 'month')
  const yearlyPrice = product.prices.find((p: any) => p.interval === 'year')
  const currentPrice = interval === 'month' ? monthlyPrice : yearlyPrice
  const isCurrentPlan = subscription === product.name
  const isMostPopular =
    (product.metadata as Record<string, string>)?.isMostPopular === 'true'

  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden rounded-2xl border p-6 text-black dark:text-white mx-auto',
        {
          'border-2 border-green-600 shadow-lg max-w-[400px] z-10':
            isMostPopular,
          'max-w-[350px] scale-95': !isMostPopular
        }
      )}
    >
      {isMostPopular && (
        <div className="absolute top-0 right-0 bg-green-600 py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center">
          <span className="text-white ml-1 font-sans font-semibold text-base">
            Best Value
          </span>
        </div>
      )}

      <div className="flex flex-col items-start mb-2">
        <h2 className="text-xl font-semibold leading-7">{product.name}</h2>
        <p className="mt-1 h-10 text-sm leading-5 text-black/70 dark:text-white/70">
          {product.description}
        </p>
      </div>

      <span className="inline-block whitespace-nowrap rounded-full bg-amber-400 px-2.5 py-0.5 my-2 text-[10px] font-semibold uppercase leading-5 tracking-wide text-black mx-auto">
        CYBER WEEK 60% OFF 🔥
      </span>

      <motion.div
        key={`${product.id}-${interval}`}
        initial="initial"
        animate="animate"
        variants={{
          initial: {
            opacity: 0,
            y: 12
          },
          animate: {
            opacity: 1,
            y: 0
          }
        }}
        transition={{
          duration: 0.4,
          delay: 0.1,
          ease: [0.21, 0.47, 0.32, 0.98]
        }}
        className="flex flex-col gap-1 mb-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm line-through text-gray-500">
            $
            {currentPrice
              ? toHumanPrice(
                  interval === 'year'
                    ? (currentPrice.unitAmount || 0) / 12 / 0.4
                    : (currentPrice?.unitAmount || 0) / 0.4,
                  0
                )
              : 'N/A'}
          </span>
          <span className="text-4xl font-bold text-black dark:text-white flex items-baseline">
            $
            {currentPrice
              ? toHumanPrice(
                  interval === 'year'
                    ? (currentPrice.unitAmount || 0) / 12
                    : currentPrice.unitAmount,
                  0
                )
              : 'N/A'}
            <span className="ml-2 text-sm font-normal text-gray-500">
              / month
            </span>
          </span>
        </div>

        <span className="block h-5 text-sm font-normal text-gray-500">
          {interval === 'year' && currentPrice && (
            <>
              ${toHumanPrice(currentPrice?.unitAmount || 0, 0)} billed annually
            </>
          )}
        </span>
      </motion.div>

      <Button
        variant={isMostPopular ? 'rainbow' : 'rainbow-outline'}
        disabled={isLoading || !currentPrice || subscription !== null}
        onClick={() =>
          currentPrice && onSubscribeClick(currentPrice, product.id)
        }
      >
        {isCurrentPlan ? (
          <p>Your Plan</p>
        ) : (
          <>
            {(!isLoading || (isLoading && id !== currentPrice?.id)) && (
              <p>Get Started</p>
            )}
            {isLoading && id === currentPrice?.id && <p>Starting...</p>}
            {isLoading && id === currentPrice?.id && (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            )}
          </>
        )}
      </Button>

      <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0 mb-4" />

      {(product.metadata as Record<string, string>) && (
        <ul className="flex flex-col gap-2 font-normal">
          {Object.entries(product.marketingFeatures || {}).map(
            ([_, feature], idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-sm font-medium text-black dark:text-white"
              >
                <CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-600 p-[2px] text-white dark:text-white" />
                <span className="flex">
                  {typeof feature === 'string' ? feature : String(feature)}
                </span>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}

export default function Pricing() {
  const { products, user, subscription } = usePricing()
  const pixel = useFacebookPixel()
  const router = useRouter()
  const [interval, setInterval] = useState<Interval>('year')
  const [isLoading, setIsLoading] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [toltReferralId, setToltReferralId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).tolt_referral) {
      setToltReferralId((window as any).tolt_referral)
    }
  }, [])

  const onSubscribeClick = async (
    price: Partial<z.infer<typeof Price>>,
    productId: string
  ) => {
    setIsLoading(true)
    setId(price.id!)

    // Redirect to login if user is not logged in
    if (!user) {
      setIsLoading(false)
      return router.push('/login')
    }
    const [data, err] = await checkoutWithStripe({
      price: price as z.infer<typeof Price>,
      referralId: toltReferralId || undefined
    })
    if (err) {
      toast.error(err.message)
      setIsLoading(false)
      return
    }
    if (!data?.sessionId) {
      toast.error('Error creating checkout session ' + data?.errorRedirect)
      setIsLoading(false)
      return
    }

    // Track the event to PostHog
    posthog.capture(POSTHOG_EVENTS.USER_INITIATE_CHECKOUT, {
      distinctId: user?.email,
      email: user?.email
    })

    // Track the event to Facebook
    const event_id = uuidv7()
    const event = {
      event_id,
      event_name: 'InitiateCheckout',
      custom_data: {
        value: Number(price.unitAmount ?? 0) / 100,
        currency: price.currency ?? undefined,
        content_ids: [productId],
        num_items: 1,
        contents: [
          {
            id: productId,
            quantity: 1
          }
        ]
      }
    }

    // Send meta pixel event
    pixel?.track(event)
    // Send conversion api event
    await trackMetaEvent(event)

    const stripe = await getStripe()
    stripe?.redirectToCheckout({ sessionId: data?.sessionId })
    setIsLoading(false)
  }

  return (
    <section id="pricing" aria-labelledby="pricing-heading">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-8 py-14">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Pricing
          </h4>
          <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Simple Pricing for Everyone.
          </h2>
          <p className="mt-6 text-xl leading-8 text-black/80 dark:text-white">
            Choose a <strong>flexible credit plan</strong> that renews monthly.
          </p>
        </div>

        <div className="flex w-full items-center justify-center space-x-2">
          <span className="text-sm text-black dark:text-white">Monthly</span>
          <Switch
            id="interval"
            checked={interval === 'year'}
            onCheckedChange={(checked) => {
              setInterval(checked ? 'year' : 'month')
            }}
          />
          <span className="text-sm text-black dark:text-white">Annual</span>
          <span className="inline-block whitespace-nowrap rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide text-white">
            4 MONTHS FREE ✨
          </span>
        </div>
        <div className="mx-auto w-full max-w-full">
          {/* Desktop view */}
          <div className="hidden lg:grid grid-cols-4 gap-4">
            <PricingCard
              isFree
              interval={interval}
              isLoading={isLoading}
              id={id}
              subscription={subscription}
              onSubscribeClick={onSubscribeClick}
              router={router}
            />
            {products
              .sort((a, b) => {
                // Sort by product.metadata.order if it exists
                const orderA = (a.metadata as any)?.order
                  ? Number((a.metadata as any).order)
                  : Infinity
                const orderB = (b.metadata as any)?.order
                  ? Number((b.metadata as any).order)
                  : Infinity
                return orderA - orderB
              })
              .map((product) => (
                <PricingCard
                  key={product.id}
                  className=""
                  product={product}
                  interval={interval}
                  isLoading={isLoading}
                  id={id}
                  subscription={subscription}
                  onSubscribeClick={onSubscribeClick}
                  router={router}
                />
              ))}
          </div>
          {/* Mobile view */}
          <div className="lg:hidden">
            <div
              className="snap-x snap-mandatory flex overflow-x-auto gap-2 pb-4 px-4 -mx-4"
              ref={(el) => {
                if (el) {
                  // Scroll to second item on load
                  const secondItem = el.children[2]
                  if (secondItem) {
                    secondItem.scrollIntoView({
                      behavior: 'auto',
                      block: 'nearest',
                      inline: 'start'
                    })
                  }
                }
              }}
              onScroll={(e) => {
                const container = e.currentTarget
                const scrollLeft = container.scrollLeft
                const containerWidth = container.clientWidth
                const scrollWidth = container.scrollWidth

                // Calculate the snap points based on total items
                const totalItems = products.length + 1 // +1 for free plan
                const itemWidth = scrollWidth / totalItems

                // Get current snap point index
                const activeIndex = Math.round(scrollLeft / itemWidth)

                // Update indicator dots
                const dots = document.querySelectorAll('.scroll-indicator')
                dots.forEach((dot, i) => {
                  if (i === activeIndex) {
                    dot.classList.add('bg-primary')
                    dot.classList.remove('bg-primary/20')
                  } else {
                    dot.classList.remove('bg-primary')
                    dot.classList.add('bg-primary/20')
                  }
                })
              }}
            >
              <div className="pl-4 snap-center shrink-0 first:pl-8">
                <PricingCard
                  isFree
                  interval={interval}
                  isLoading={isLoading}
                  id={id}
                  subscription={subscription}
                  onSubscribeClick={onSubscribeClick}
                  router={router}
                />
              </div>
              {products
                .sort((a, b) => {
                  const orderA = (a.metadata as any)?.order
                    ? Number((a.metadata as any).order)
                    : Infinity
                  const orderB = (b.metadata as any)?.order
                    ? Number((b.metadata as any).order)
                    : Infinity
                  return orderA - orderB
                })
                .map((product, index) => (
                  <div
                    key={product.id}
                    className={`snap-center shrink-0 ${index === products.length - 1 ? 'pr-8' : ''}`}
                  >
                    <PricingCard
                      product={product}
                      interval={interval}
                      isLoading={isLoading}
                      id={id}
                      subscription={subscription}
                      onSubscribeClick={onSubscribeClick}
                      router={router}
                    />
                  </div>
                ))}
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <div className="w-8 h-1.5 rounded-full bg-primary scroll-indicator transition-colors" />
              {products.map((_, index) => (
                <div
                  key={index}
                  className="w-8 h-1.5 rounded-full bg-primary/20 scroll-indicator transition-colors"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
