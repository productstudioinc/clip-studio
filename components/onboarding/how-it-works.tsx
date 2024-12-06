'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'

export function HowItWorks() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const steps = [
    {
      number: 1,
      title: 'Pick a Template',
      description:
        'We have several templates such as reddit stories, twitter threads, ai videos and more.',
      icon: '👉'
    },
    {
      number: 2,
      title: 'Customize Your Video',
      description: 'Pick a voice, background, and style for your video.',
      icon: '🎨'
    },
    {
      number: 3,
      title: 'Generate Your Video',
      description:
        'Let our AI generate your video, then share it on social media.',
      icon: '🚀'
    }
  ]

  function onContinue() {
    const params = new URLSearchParams(searchParams)
    params.set('step', '2')
    router.push(`/onboarding?${params.toString()}`)
  }
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">How it works</h1>
      </div>
      <div className="space-y-4 pb-20 md:pb-0 flex-grow w-full max-w-4xl mx-auto px-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center space-x-4 bg-secondary/50 rounded-lg p-4"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl">
              {step.number}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed md:static bottom-0 left-0 right-0 p-4 bg-background md:bg-transparent border-t md:border-t-0 border-border">
        <div className="flex justify-center">
          <Button onClick={onContinue} className="w-full max-w-4xl">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
