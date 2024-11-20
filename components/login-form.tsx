'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    <Card className="w-full grid md:grid-cols-3 overflow-hidden place-items-center text-center">
      <video
        src="https://assets.clip.studio/reddit_preview.webm"
        autoPlay
        muted
        loop
        playsInline
        className="col-span-1 hidden md:block w-full h-full object-cover"
      />

      <div className="md:col-span-2">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="size-32">
            <AvatarImage src="/logo.svg" />
            <AvatarFallback>CS</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-medium">
            Get Started with Clip Studio
          </CardTitle>
          <CardDescription>
            Sign in or create an account to get started
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
          <div className="text-xs mt-6">
            <span>By signing up, you agree to our</span>{' '}
            <Link href="/terms" className="underline">
              Terms
            </Link>{' '}
            <span>and</span>{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
