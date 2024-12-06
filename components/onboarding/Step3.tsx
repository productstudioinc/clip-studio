'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const formSchema = z.object({
  plan: z.enum(['monthly', 'yearly'])
})

export function Step3() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plan: 'yearly'
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams(searchParams)
    params.set('plan', values.plan)
    params.set('step', '4') // Assuming this is the last step

    // Here you would typically send the data to your backend
    console.log('Onboarding completed:', Object.fromEntries(params))

    // Redirect to dashboard or show completion message
    router.push(`/success?${params.toString()}`)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full max-w-6xl mx-auto p-4"
        >
          <div className="mx-auto">
            <div className="mb-8 text-center">
              <div className="relative mx-auto mb-4 h-32 w-32">
                <Image src="/logo.svg" alt="Mascot" width={128} height={128} />
              </div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Clip Studio Pro
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">Choose a plan</p>
            </div>

            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-4"
                    >
                      <FormItem>
                        <Label asChild>
                          <Card
                            className="border-2 bg-card shadow-lg rounded-2xl cursor-pointer"
                            // onClick={() => field.onChange('monthly')}
                          >
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <div>
                                  <h2 className="text-lg font-semibold">
                                    1 month
                                  </h2>
                                  <div className="text-sm text-muted-foreground">
                                    €13,99 / MO
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </FormItem>
                      <FormItem>
                        <Label asChild>
                          <Card
                            className="relative border-4 border-primary bg-card shadow-lg rounded-2xl cursor-pointer"
                            // onClick={() => field.onChange('yearly')}
                          >
                            <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                              MOST POPULAR
                            </div>
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yearly" id="yearly" />
                                <div>
                                  <h2 className="text-lg font-semibold">
                                    12 months
                                  </h2>
                                  <div className="text-sm text-muted-foreground line-through">
                                    €167,88
                                  </div>
                                  <div className="text-lg font-bold">
                                    €87,99 (€7,34 / MO)
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="mt-8 space-y-4">
              <Button
                type="submit"
                variant="rainbow"
                className="w-full"
                size="lg"
              >
                TRY FREE AND SUBSCRIBE
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Cancel anytime in the App Store
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
