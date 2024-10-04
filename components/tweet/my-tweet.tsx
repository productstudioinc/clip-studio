import { enrichTweet, TweetBody, type TwitterComponents } from 'react-tweet'
import type { Tweet } from 'react-tweet/api'

import { TweetContainer } from './tweet-container'
import { TweetHeader } from './tweet-header'
import { TweetMedia } from './tweet-media'

type Props = {
  tweet: Tweet
  components?: TwitterComponents
}

export const MyTweet = ({ tweet: t, components }: Props) => {
  const tweet = enrichTweet(t)
  return (
    <TweetContainer className="dark">
      <TweetHeader tweet={tweet} components={components} />
      <TweetBody tweet={tweet} />
      {tweet.mediaDetails?.length ? (
        <TweetMedia tweet={tweet} components={components} />
      ) : null}
    </TweetContainer>
  )
}
