import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import s from './tweet-container.module.css'
import { tweetTheme } from './tweet-theme'

type Props = {
  className?: string
  children: ReactNode
  mode?: 'light' | 'dark'
}

export const TweetContainer = ({
  className,
  children,
  mode = 'dark'
}: Props) => {
  const currentTheme = mode === 'dark' ? tweetTheme.dark : tweetTheme.light

  return (
    <div
      className={cn('react-tweet-theme', s.root, className)}
      style={{
        backgroundColor: currentTheme.background,
        borderColor: currentTheme.border,
        color: currentTheme.text,
        transition: 'none'
      }}
    >
      <article className={s.article}>{children}</article>
    </div>
  )
}
