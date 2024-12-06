import { getUser, getUserSubscription } from '@/actions/auth/user'
import { getProducts } from '@/actions/db/user-queries'

export async function getPricingData() {
  const [products, { user }, subscription] = await Promise.all([
    getProducts(),
    getUser(),
    getUserSubscription()
  ])

  return {
    products,
    user,
    subscription: subscription ?? null
  }
}
