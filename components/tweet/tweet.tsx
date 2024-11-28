'use client'

import { TwitterVideoProps } from '@/stores/templatestore'

import { MyTweet } from './my-tweet'

export const UserTweet = ({
  tweet,
  mode,
  className
}: {
  tweet: TwitterVideoProps['tweets'][number]
  mode?: 'light' | 'dark'
  className?: string
}) => {
  return <MyTweet tweet={tweet} mode={mode} className={className} />
}
