import { ReactNode } from 'react'

import { Breadcrumbs } from '@/components/breadcrumbs'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Breadcrumbs />
      <div className="max-w-5xl mx-auto">{children}</div>
    </>
  )
}
