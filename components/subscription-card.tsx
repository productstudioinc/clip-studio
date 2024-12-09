import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GetUserUsageResult } from '@/actions/db/user-queries'
import { getBillingPortal } from '@/actions/stripe/server'
import { createClient } from '@/supabase/client'
import { Coins, Loader2, Settings, Users, ZapIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function SubscriptionCard({
  subscriptionName,
  usage,
  userId
}: {
  subscriptionName: string | null | undefined
  usage: GetUserUsageResult
  userId: string
}) {
  const { isPending, execute } = useServerAction(getBillingPortal)
  const manageSubscription = async () => {
    const [data, err] = await execute()
    if (err) {
      toast.error(err.message)
    } else {
      window.open(data.url, '_blank')
    }
  }

  // Check if totalLimits.credits is null
  const showOnlyUpgradeCard = usage?.totalLimits.credits === null

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle>Your Usage</CardTitle>
        <CardDescription>{subscriptionName || 'Free Plan'}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {showOnlyUpgradeCard ? (
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: 'sm', variant: 'rainbow' }),
              'w-full'
            )}
          >
            <ZapIcon className="h-4 w-4 mr-2 fill-current" />
            Upgrade
          </Link>
        ) : (
          <>
            <UsageDisplay
              usage={usage}
              userId={userId}
              showConnectedAccounts={!!subscriptionName}
            />
            {subscriptionName ? (
              <Button
                size={'sm'}
                className="w-full mt-4"
                onClick={manageSubscription}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Manage
              </Button>
            ) : (
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ size: 'sm', variant: 'rainbow' }),
                  'w-full mt-4'
                )}
              >
                <ZapIcon className="h-4 w-4 mr-2 fill-current" />
                Upgrade
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

const UsageDisplay = ({
  usage: initialUsage,
  userId,
  showConnectedAccounts
}: {
  usage: GetUserUsageResult
  userId: string
  showConnectedAccounts: boolean
}) => {
  const [realtimeUsage, setRealtimeUsage] =
    useState<GetUserUsageResult>(initialUsage)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime_usage')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_usage',
          filter: `user_id=eq.${userId}`
        },
        ({ new: newUsage }: { new: any }) => {
          setRealtimeUsage((prevUsage) => {
            if (!prevUsage) return prevUsage
            return {
              ...prevUsage,
              currentUsage: {
                creditsLeft:
                  newUsage.credits_left ?? prevUsage.currentUsage.creditsLeft,
                connectedAccountsLeft:
                  newUsage.connected_accounts_left ??
                  prevUsage.currentUsage.connectedAccountsLeft
              }
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  if (!realtimeUsage) return null
  const { currentUsage, totalLimits } = realtimeUsage

  const calculateUsed = (total: number | null, left: number | null) =>
    total !== null && left !== null ? total - left : null // Calculate used credits

  const calculatePercentage = (used: number | null, total: number | null) => {
    if (used === null || total === null) return 0
    const percentage = total > 0 ? Math.floor((used / total) * 100) : 0
    return percentage
  }

  const usageItems = [
    {
      label: 'Credits Used',
      icon: Coins,
      current: calculateUsed(totalLimits.credits, currentUsage.creditsLeft),
      total: totalLimits.credits,
      remaining: currentUsage.creditsLeft,
      unit: '',
      percentage: calculatePercentage(
        calculateUsed(totalLimits.credits, currentUsage.creditsLeft),
        totalLimits.credits
      )
    },
    ...(showConnectedAccounts
      ? [
          {
            label: 'Connected Accounts',
            icon: Users,
            current: calculateUsed(
              totalLimits.connectedAccounts,
              currentUsage.connectedAccountsLeft
            ),
            total: totalLimits.connectedAccounts,
            remaining: currentUsage.connectedAccountsLeft,
            unit: '',
            percentage: calculatePercentage(
              calculateUsed(
                totalLimits.connectedAccounts,
                currentUsage.connectedAccountsLeft
              ),
              totalLimits.connectedAccounts
            )
          }
        ]
      : [])
  ]
  return (
    <div
      className={`flex flex-col gap-3 ${showConnectedAccounts ? 'pb-0' : 'pb-2'}`}
    >
      {usageItems.map((item, index) => (
        <div
          key={index}
          className={`flex items-start gap-2 ${index === usageItems.length - 1 ? '' : 'pb-2'}`}
        >
          <item.icon className="h-4 w-4 text-muted-foreground mt-1" />
          <div className="flex-1">
            <Progress value={item.percentage} className="h-2" />
            <div className="text-xs mt-1 text-muted-foreground font-medium flex flex-wrap justify-between">
              <span className="break-normal">
                {item.remaining !== null && item.remaining > 0
                  ? `${item.remaining} credits left`
                  : `${Math.abs(item.remaining ?? 0)} credits over limit`}
                {item.remaining !== null &&
                  item.remaining > totalLimits.credits && (
                    <>
                      <br />
                      {` (+${item.remaining - totalLimits.credits}`}
                      {` bonus credits)`}
                    </>
                  )}
              </span>

              {item.percentage >= 0 && (
                <span>{`${item.percentage}% used`}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
