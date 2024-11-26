import { Metadata } from 'next'
import Link from 'next/link'
import { stripe } from '@/utils/stripe/config'
import { Check, Clapperboard } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import Confetti from '@/components/confetti'
import { FacebookTrackOnRender } from '@/components/meta'

export const metadata: Metadata = {
  robots: 'noindex, nofollow'
}

export default async function SuccessPage({
  searchParams
}: {
  searchParams: { session_id: string }
}) {
  const sessionId = searchParams?.session_id
  if (!sessionId) {
    throw new Error(
      'No session ID found. Please contact support support@clip.studio'
    )
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return (
    <section>
      <Confetti />
      <FacebookTrackOnRender
        event={{
          event_name: 'Subscribe',
          event_id: session.id,
          custom_data: {
            value: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'USD'
          }
        }}
      />
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center px-6 py-12">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <p className="rounded-full bg-green-50 p-3 text-sm font-medium dark:bg-green-800">
            <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-5xl">
            Welcome to Clip Studio!
          </h1>

          <div className="group mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <Link href="/" className={buttonVariants({ variant: 'default' })}>
              <Clapperboard className="mr-2 h-4 w-4" />
              <span>Let&apos;s get started</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
