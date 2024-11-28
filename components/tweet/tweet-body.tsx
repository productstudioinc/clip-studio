import { TwitterVideoProps } from '@/stores/templatestore'

import s from './tweet-body.module.css'
import { tweetTheme } from './tweet-theme'

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  mode?: 'light' | 'dark'
}

export const TweetBody = ({ tweet, mode = 'dark' }: Props) => {
  const currentTheme = mode === 'dark' ? tweetTheme.dark : tweetTheme.light

  return (
    <p className={s.root} style={{ color: currentTheme.text }}>
      {tweet.content}
    </p>
  )
}
