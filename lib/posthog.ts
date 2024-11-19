import { PostHog } from 'posthog-node'

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0
  })
  return posthogClient
}

export enum POSTHOG_EVENTS {
  // Step 1
  USER_SIGNUP = 'USER_SIGNUP',

  // Step 2
  USER_INITIATE_CHECKOUT = 'USER_INITIATE_CHECKOUT',

  // Step 3
  USER_SUBSCRIBE = 'USER_SUBSCRIBE'
}
