'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Icons } from '@/components/icons'

export default function LoginComponent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.refresh()
      }
    })

    setIsMounted(true)

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  useEffect(() => {
    if (isMounted) {
      const message = searchParams.get('message')
      if (message) {
        toast.error(message)
      }
    }
  }, [isMounted, searchParams])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Login through one of our supported providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${location.origin}/auth/callback`
                }
              })
            }}
          >
            <Icons.google className="mr-2 h-4 w-4 dark:invert" />
            Login with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
