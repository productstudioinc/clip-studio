import React from 'react'

import { cn } from '@/lib/utils'

export function NumberedSteps({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {React.Children.toArray(children).map((child, index) => (
        <div
          key={index}
          className={cn(
            'relative before:text-muted-foreground before:text-sm before:content-[var(--step-number)] before:block before:mb-2'
          )}
          style={
            {
              '--step-number': `'Step ${index + 1}'`
            } as React.CSSProperties
          }
          data-before-content={index + 1}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
