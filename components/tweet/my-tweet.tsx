import { TwitterVideoProps } from '@/stores/templatestore'
import { type TwitterComponents } from 'react-tweet'

import { cn } from '../../lib/utils'
import { TweetActions } from './tweet-actions'
import { TweetBody } from './tweet-body'
import { TweetContainer } from './tweet-container'
import { TweetHeader } from './tweet-header'
import { TweetMedia } from './tweet-media'

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  components?: TwitterComponents
  className?: string
}

export const MyTweet = ({ tweet, components, className }: Props) => {
  'use no memo'
  return (
    <TweetContainer className={cn('dark', className)}>
      <TweetHeader tweet={tweet} components={components} />
      <TweetBody tweet={tweet} />
      {tweet.image ? (
        <TweetMedia tweet={tweet} components={components} />
      ) : null}
      <TweetActions tweet={tweet} />
    </TweetContainer>
  )
}
