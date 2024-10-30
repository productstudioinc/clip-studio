import { TwitterVideoProps } from '@/stores/templatestore'
import { type TwitterComponents } from 'react-tweet'

import { TweetBody } from './tweet-body'
import { TweetContainer } from './tweet-container'
import { TweetHeader } from './tweet-header'
import { TweetMedia } from './tweet-media'

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  components?: TwitterComponents
}

export const MyTweet = ({ tweet, components }: Props) => {
  return (
    <TweetContainer className="dark">
      <TweetHeader tweet={tweet} components={components} />
      <TweetBody tweet={tweet} />
      {tweet.image ? (
        <TweetMedia tweet={tweet} components={components} />
      ) : null}
    </TweetContainer>
  )
}
