'use server'

import { Facebook } from '@/types/meta'
import { facebook } from '@/lib/meta/index'

export async function trackMetaEvent<T extends Facebook.Event.EventName>(
  e: Facebook.Event<T>
) {
  await facebook.track(e)
}
