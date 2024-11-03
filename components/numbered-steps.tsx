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
            'relative before:-ml-16 before:text-muted-foreground before:text-sm before:content-[var(--step-number)] before:sticky before:top-4 before:-mt-4 before:hidden before:2xl:block',
            className
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
