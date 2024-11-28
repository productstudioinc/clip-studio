import { TwitterVideoProps } from '@/stores/templatestore'
import { type TwitterComponents } from 'react-tweet'

import { TweetActions } from './tweet-actions'
import { TweetBody } from './tweet-body'
import { TweetContainer } from './tweet-container'
import { TweetHeader } from './tweet-header'
import { TweetMedia } from './tweet-media'

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  mode?: 'light' | 'dark'
  components?: TwitterComponents
  className?: string
}

export const MyTweet = ({
  tweet,
  mode = 'dark',
  components,
  className
}: Props) => {
  return (
    <TweetContainer mode={mode} className={className}>
      <TweetHeader tweet={tweet} components={components} mode={mode} />
      {!tweet.hideText && <TweetBody tweet={tweet} mode={mode} />}
      {tweet.image ? (
        <TweetMedia tweet={tweet} components={components} mode={mode} />
      ) : null}
      <TweetActions tweet={tweet} mode={mode} />
    </TweetContainer>
  )
}
