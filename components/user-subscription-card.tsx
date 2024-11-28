import { getStripeSubscriptionData } from '@/actions/stripe/server'
import { differenceInMonths, format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default async function UserSubscriptionCard({
  subscriptionId,
  className
}: {
  subscriptionId: string
  className?: string
}) {
  const subscriptionData = await getStripeSubscriptionData({ subscriptionId })
  const subscription = subscriptionData[0]

  if (!subscription) {
    return <div>No subscription found</div>
  }

  const subscriptionStartDate = new Date(subscription.startDate * 1000)
  const currentDate = new Date()
  const monthsSubscribed = differenceInMonths(
    currentDate,
    subscriptionStartDate
  )

  return (
    <Card className={cn('p-6', className)}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(subscription?.status)}>
              {subscription.status}
            </Badge>
            {subscription.cancelAt && (
              <Badge variant="destructive">Canceling</Badge>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Subscription ID</p>
          <p className="font-medium">{subscriptionId}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Current Period</p>
          <p className="font-medium">
            {format(new Date(subscription.currentPeriodStart * 1000), 'PP')} -
            {format(new Date(subscription.currentPeriodEnd * 1000), 'PP')}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Subscription Duration</p>
          <p className="font-medium">
            {monthsSubscribed} month{monthsSubscribed !== 1 ? 's' : ''}
          </p>
        </div>

        {subscription.trialEnd && (
          <div>
            <p className="text-sm text-muted-foreground">Trial Ends</p>
            <p className="font-medium">
              {format(new Date(subscription.trialEnd * 1000), 'PP')}
            </p>
          </div>
        )}

        {subscription.paymentMethod && (
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium">
              {subscription.paymentMethod.brand?.toUpperCase()} ••••{' '}
              {subscription.paymentMethod.last4}
              <span className="text-sm text-muted-foreground ml-2">
                (expires {subscription.paymentMethod.expiryMonth}/
                {subscription.paymentMethod.expiryYear})
              </span>
            </p>
          </div>
        )}

        {subscription.items.map((item) => (
          <div key={item.id} className="col-span-2">
            <p className="text-sm text-muted-foreground">Plan Details</p>
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{item.price.product.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.price.product.description}
              </p>
              <p className="text-sm mt-1">
                {((item.price.amount ?? 0) / 100).toLocaleString('en-US', {
                  style: 'currency',
                  currency: item.price.currency
                })}
                {item.price.interval && ` / ${item.price.interval}`}
                {(item.quantity ?? 0) > 1 && ` × ${item.quantity}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function UserSubscriptionCardSkeleton({
  className
}: {
  className?: string
}) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
        <div className="col-span-2">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </Card>
  )
}

function getStatusVariant(status: string | undefined | null) {
  switch (status) {
    case 'active':
      return 'success'
    case 'trialing':
      return 'secondary'
    case 'canceled':
    case 'incomplete_expired':
      return 'destructive'
    case 'incomplete':
    case 'past_due':
      return 'destructive'
    default:
      return 'secondary'
  }
}
