import { TwitterVideoProps } from '@/stores/templatestore'

import s from './tweet-body.module.css'

export const TweetBody = ({
  tweet
}: {
  tweet: TwitterVideoProps['tweets'][number]
}) => <p className={s.root}>{tweet.content}</p>
