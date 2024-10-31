'use client'

import { TwitterVideoProps } from '@/stores/templatestore'

import { MyTweet } from './my-tweet'

export const UserTweet = ({
  tweet,
  className
}: {
  tweet: TwitterVideoProps['tweets'][number]
  className?: string
}) => {
  return <MyTweet tweet={tweet} className={className} />
}
