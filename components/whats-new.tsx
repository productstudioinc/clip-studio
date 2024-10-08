'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

import AnimatedShinyText from './ui/animated-shiny-text'

type Change = {
  date: Date
  items: string[]
}

const CHANGES: Change[] = [
  {
    date: new Date(2024, 9, 7),
    items: [
      'Major performance improvements',
      'Clips template',
      'Messages template'
    ]
  }
]

export function WhatsNew({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const [scrollAreaHeight, setScrollAreaHeight] = useState<number | 'auto'>(
    'auto'
  )
  const changesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isExpanded])

  useEffect(() => {
    if (changesRef.current) {
      const changesHeight = changesRef.current.scrollHeight
      setScrollAreaHeight(changesHeight > 200 ? 200 : 'auto')
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
                <ScrollArea
                  className="w-full rounded-md"
                  style={{ height: scrollAreaHeight }}
                >
                  <div ref={changesRef}>
                    {CHANGES.map((change, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="font-semibold">
                          {format(change.date, 'MM/dd/yy')}
                        </h3>
                        <ul className="list-disc list-inside">
                          {change.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
