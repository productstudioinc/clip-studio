'use client'

import { useRouter } from 'next/navigation'

import { LoginDrawer } from '@/components/login-drawer'

export default function LoginClient() {
  const router = useRouter()
  return <LoginDrawer onOpenChange={(open) => !open && router.back()} />
}
