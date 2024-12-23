import { CheckIcon, XIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function BenefitsCard() {
  const outsourceCost = 200
  const outsourceTime = 3
  return (
    <div className="relative container mx-auto grid px-4 py-16 max-w-5xl gap-8">
      <h2 className="text-4xl font-bold text-center">Benefits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="font-bold">Clip Studio</CardTitle>
            <CardDescription>
              The smart choice for video creators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-6 p-1 w-6 flex-none text-green-600 bg-green-200 rounded-full" />
              <span>
                <strong>Cost:</strong> Starting at just $19/month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-6 p-1 w-6 flex-none text-green-600 bg-green-200 rounded-full" />
              <span>
                <strong>Time:</strong> Create videos in minutes, not days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-6 p-1 w-6 flex-none text-green-600 bg-green-200 rounded-full" />
              <span>
                <strong>AI-Powered:</strong> Smart tools do the heavy lifting
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-6 p-1 w-6 flex-none text-green-600 bg-green-200 rounded-full" />
              <span>
                <strong>Templates:</strong> 6+ professional templates included
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-6 p-1 w-6 flex-none text-green-600 bg-green-200 rounded-full" />
              <span>
                <strong>Support:</strong> 24/7 priority customer service
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-6 p-1 w-6 flex-none text-green-600 bg-green-200 rounded-full" />
              <span>
                <strong>Guarantee:</strong> 30-day money back guarantee
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="font-bold">
              Outsourcing to Video Editors
            </CardTitle>
            <CardDescription>
              The hidden costs of hiring freelance editors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <XIcon className="h-6 p-1 w-6 flex-none text-red-600 bg-red-200 rounded-full" />
              <span>
                <strong>Cost:</strong> ~${outsourceCost.toLocaleString()}/video
                for regular content
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XIcon className="h-6 p-1 w-6 flex-none text-red-600 bg-red-200 rounded-full" />
              <span>
                <strong>Time:</strong> {outsourceTime} days average turnaround
                time
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XIcon className="h-6 p-1 w-6 flex-none text-red-600 bg-red-200 rounded-full" />
              <span>
                <strong>Quality:</strong> Inconsistent results between editors
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XIcon className="h-6 p-1 w-6 flex-none text-red-600 bg-red-200 rounded-full" />
              <span>
                <strong>Revisions:</strong> Extra costs for each round of
                changes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XIcon className="h-6 p-1 w-6 flex-none text-red-600 bg-red-200 rounded-full" />
              <span>
                <strong>Management:</strong> Time spent finding and managing
                editors
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XIcon className="h-6 p-1 w-6 flex-none text-red-600 bg-red-200 rounded-full" />
              <span>
                <strong>Risk:</strong> No guarantee of meeting deadlines
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
