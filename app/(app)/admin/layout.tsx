import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import { isAdmin } from '@/actions/db/admin-queries'

export const metadata: Metadata = {
  robots: 'noindex, nofollow'
}

export default async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  const { user } = await getUser()

  if (!user) {
    redirect('/')
  }

  const admin = await isAdmin(user.id)

  if (!admin) {
    redirect('/')
  }

  return <div className="max-w-5xl mx-auto">{children}</div>
}
