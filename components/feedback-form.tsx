'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { submitFeedback } from '@/actions/db/user-queries'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowUpCircle,
  Bug,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageSquare,
  Star
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useServerAction } from 'zsa-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Define feedback types with icons
const feedbackTypes = [
  {
    value: 'template_request',
    label: 'Request a Template',
    icon: MessageSquare
  },
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb },
  {
    value: 'improvement',
    label: 'Improvement Suggestion',
    icon: ArrowUpCircle
  },
  { value: 'other', label: 'Other', icon: HelpCircle }
] as const

// Define the form schema with Zod
const formSchema = z.object({
  feedbackType: z.enum(
    feedbackTypes.map((type) => type.value) as [string, ...string[]],
    {
      required_error: 'Please select a feedback type.'
    }
  ),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, {
    message: 'Comment must be at least 10 characters.'
  })
})

type props = z.infer<typeof formSchema>

export function FeedbackForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isPending, execute } = useServerAction(submitFeedback)

  const initialFeedbackType = searchParams.get('type') as
    | props['feedbackType']
    | null

  const form = useForm<props>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedbackType: initialFeedbackType || undefined,
      rating: 0,
      comment: ''
    }
  })

  async function onSubmit(values: props) {
    const [_data, err] = await execute(values)
    if (err) {
      toast.error(err.message)
    } else {
      toast.success('Feedback Submitted', {
        description: 'Thank you for your feedback!'
      })
      router.back()
      form.reset()
    }
  }

  const StarRating = ({ field }: { field: any }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${star <= field.value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            onClick={() => field.onChange(star)}
          />
        ))}
      </div>
    )
  }

  const updateUrlSearchParam = (type: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('type', type)
    router.push(`?${newSearchParams.toString()}`, { scroll: false })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="feedbackType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  updateUrlSearchParam(value)
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {feedbackTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <type.icon className="mr-2 h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <StarRating field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide details about your feedback..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Feedback
        </Button>
      </form>
    </Form>
  )
}
