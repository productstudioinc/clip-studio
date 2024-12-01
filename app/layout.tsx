import { constructMetadata } from '@/lib/seo-utils'
import { Toaster } from '@/components/ui/sonner'
import { ErrorToast } from '@/components/error-toast'
import { LocalStorageTools } from '@/components/local-storage-tools'
import { ThemeProvider } from '@/components/theme-provider'

import '@/styles/globals.css'

import { Suspense } from 'react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { AxiomWebVitals } from 'next-axiom'

import { facebook } from '@/lib/meta'
import { FacebookPageView } from '@/components/meta/pageview'
import { FacebookTrackingProvider } from '@/components/meta/tracking-provider'
import UTMTracker from '@/components/utm-tracker'

import { PHProvider } from './_analytics/provider'

const PostHogPageView = dynamic(() => import('./_analytics/PostHogPageView'), {
  ssr: false
})

export const metadata: Metadata = constructMetadata({
  title: 'Clip Studio | Create viral short-form videos with AI'
})

const monserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat'
})

const komika = localFont({
  src: './komika.ttf',
  display: 'swap',
  variable: '--font-komika'
})

const chirp = localFont({
  src: [
    {
      path: './Chirp-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: './Chirp-Medium.ttf',
      weight: '500',
      style: 'normal'
    },
    {
      path: './Chirp-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-chirp'
})

export default async function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        src="https://cdn.tolt.io/tolt.js"
        data-tolt="4196373f-07fe-4d9a-927b-5aa9c7952153"
      />
      <AxiomWebVitals />
      <FacebookTrackingProvider client={facebook}>
        <PHProvider>
          <body
            className={`${GeistSans.className} ${monserrat.variable} ${komika.variable} ${chirp.variable}`}
          >
            <Suspense>
              <ErrorToast />
            </Suspense>
            <Suspense>
              <PostHogPageView />
            </Suspense>
            <Suspense>
              <FacebookPageView />
            </Suspense>
            <LocalStorageTools />
            <UTMTracker />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              {modal}
              <Toaster position="top-right" />
            </ThemeProvider>
          </body>
        </PHProvider>
      </FacebookTrackingProvider>
    </html>
  )
}
