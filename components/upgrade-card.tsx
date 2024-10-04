import Link from 'next/link'
import { ZapIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function UpgradeCard() {
  return (
    <Card>
      <CardHeader className="p-2 pt-0 md:p-4">
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>
          Unlock all features and get unlimited access to our support team.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
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
      </CardContent>
    </Card>
  )
}
