'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'

export const schema = z.object({
  name: z.string().trim().min(1, { message: 'Please enter a valid name.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  apiKey: z.string().min(1, { message: 'Please enter a valid API key.' })
})

export type ProfileFormProps = {
  className?: string
  user: any // TODO: add proper type
}

export const ProfileForm = ({ className, user }: ProfileFormProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof schema>>({
    values: {
      name: user.name ?? '',
      email: user.email ?? '',
      apiKey: user.apiKey ?? ''
    },
    resolver: zodResolver(schema)
  })

  const onFormSubmit = async ({ name, email }: z.infer<typeof schema>) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          email
        })
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error('An error occurred', {
          description: json.error
        })
        return
      }

      toast.success('Profile updated', {
        description: 'Your profile has been updated successfully.',
        duration: 5000
      })

      router.refresh()
    } catch (err) {
      toast.error('An unknown error occurred', {
        description:
          'We encountered an unknown error while attempting to update your profile. Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('flex w-full flex-col gap-y-4', className)}
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="test@gmail.com" {...field} />
              </FormControl>
              <FormDescription>This is your email address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Api Key</FormLabel>
              <FormControl>
                <Input
                  placeholder="clpxnasdcaosuvnbasvou"
                  {...field}
                  disabled
                  type="text"
                />
              </FormControl>
              <FormDescription>
                This is your api key. Keep it safe.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <Button type="submit" disabled={isLoading} className="flex gap-2">
            {isLoading ? `Submitting` : `Submit`}
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
