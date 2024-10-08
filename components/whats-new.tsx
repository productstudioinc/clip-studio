'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import AnimatedShinyText from './ui/animated-shiny-text'

export function WhatsNew({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isExpanded])

  return (
    <motion.div
      className={cn('z-10 flex items-center justify-center', className)}
      initial={false}
      animate={{
        height: isExpanded ? `${contentHeight + 40}px` : '40px'
      }}
      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
    >
      <motion.div
        className={cn(
          'group border border-black/5 bg-neutral-100 text-base w-full rounded-3xl',
          'flex flex-col items-center',
          'hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800',
          'overflow-hidden'
        )}
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : '40px',
          borderRadius: '1.5rem'
        }}
        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
        style={{ borderRadius: '1.5rem' }}
      >
        <motion.div
          className="w-full flex items-center justify-center"
          style={{ minHeight: '40px' }}
          layout="position"
        >
          <AnimatedShinyText className="inline-flex items-center justify-center px-4 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
            <span className="mr-1">✨ What&apos;s New</span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpIcon className="size-3" />
            </motion.span>
          </AnimatedShinyText>
        </motion.div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <div
                ref={contentRef}
                className="px-4 pb-2 text-sm text-muted-foreground"
              >
                <ul className="list-disc list-inside">
                  <li>Major performance improvements</li>
                  <li>Clips template</li>
                  <li>Texts template</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
