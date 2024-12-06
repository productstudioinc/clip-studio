'use client'

import { useEffect, useState } from 'react'
import { getRecentStripeData } from '@/actions/stripe/server'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'

interface StripeData {
  type: string
  id: string
  country: string | null
  date: string
  verified: boolean
  amount: string
  currency: string
  name: string | null
  state: string | null
}

const formatTimeAgo = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

export default function StripePopup() {
  const [stripeData, setStripeData] = useState<StripeData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fetchStripeData = async () => {
      const data = await getRecentStripeData()
      setStripeData(data)
    }

    fetchStripeData()
  }, [])

  useEffect(() => {
    if (stripeData.length === 0) return

    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % stripeData.length)
        setIsVisible(true)
      }, 500) // Wait for exit animation to complete
    }, 5000) // Change data every 5 seconds

    return () => clearInterval(interval)
  }, [stripeData])

  if (stripeData.length === 0) return null

  const currentData = stripeData[currentIndex]

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-background rounded-lg shadow-lg p-4 max-w-[325px] border"
          >
            <p className="text-blue-400 text-sm font-semibold leading-relaxed">
              {currentData.name && <strong>{currentData.name}</strong>}
              {currentData.state && currentData.country && (
                <>
                  {' from '}
                  <strong>
                    {currentData.state}, {currentData.country}
                  </strong>
                </>
              )}
              {currentData.type && (
                <>
                  {' '}
                  {currentData.type === 'subscription' ? 'subscribed' : 'paid'}
                </>
              )}
            </p>
            <p className="text-muted-foreground mt-2 text-xs flex items-center">
              {currentData.date && formatTimeAgo(currentData.date)}
              {currentData.date && currentData.verified && ' | '}
              {currentData.verified && (
                <span className="ml-2 flex items-center text-blue-400 dark:text-blue-300 font-medium">
                  <BadgeCheck className="w-4 h-4 mr-1 fill-blue-400 dark:fill-blue-300 text-background" />{' '}
                  Verified
                </span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
