'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'

export function GetStarted() {
  const router = useRouter()

  const features = [
    {
      title: 'Create Your First Video',
      description: 'Start by creating your first AI-generated video.',
      icon: '🎥'
    },
    {
      title: 'Explore Templates',
      description:
        'Browse our collection of templates for various content types.',
      icon: '📚'
    },
    {
      title: 'Customize and Share',
      description: 'Personalize your videos and share them on social media.',
      icon: '🌟'
    }
  ]

  function onGetStarted() {
    router.push('/')
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Get Started with Clip Studio
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          You&apos;re all set! Let&apos;s create some amazing videos.
        </p>
      </div>
      <div className="space-y-6 pb-20 md:pb-0 flex-grow w-full max-w-4xl mx-auto px-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center space-x-4 bg-secondary/50 rounded-lg p-6"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed md:static bottom-0 left-0 right-0 p-4 bg-background md:bg-transparent border-t md:border-t-0 border-border">
        <div className="flex justify-center">
          <Button onClick={onGetStarted} className="w-full max-w-4xl" size="lg">
            Start Creating
          </Button>
        </div>
      </div>
    </div>
  )
}
