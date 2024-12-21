import { SiteBanner } from '@/components/site-banner'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <SiteBanner /> */}
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
