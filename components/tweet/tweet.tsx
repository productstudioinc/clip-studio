'use client'

import { TwitterVideoProps } from '@/stores/templatestore'

import { MyTweet } from './my-tweet'

export const UserTweet = ({
  tweet
}: {
  tweet: TwitterVideoProps['tweets'][number]
}) => {
  return <MyTweet tweet={tweet} />
}
