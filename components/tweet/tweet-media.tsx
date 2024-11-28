import { TwitterVideoProps } from '@/stores/templatestore'
import clsx from 'clsx'
import { TwitterComponents } from 'react-tweet'

import { MediaImg } from './media-img'
import s from './tweet-media.module.css'
import { tweetTheme } from './tweet-theme'

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  components?: TwitterComponents
  mode?: 'light' | 'dark'
  quoted?: boolean
}

export const TweetMedia = ({
  tweet,
  components,
  mode = 'dark',
  quoted
}: Props) => {
  const Img = components?.MediaImg ?? MediaImg
  const currentTheme = mode === 'dark' ? tweetTheme.dark : tweetTheme.light

  return tweet.image ? (
    <div
      className={clsx(s.root, !quoted && s.rounded)}
      style={{ borderColor: currentTheme.border }}
    >
      <div className={s.mediaWrapper}>
        <div className={s.mediaContainer}>
          <div
            className={s.skeleton}
            style={{
              paddingBottom: '56.25%'
            }}
          />
          <Img
            src={tweet.image}
            alt="Tweet image"
            className={s.image}
            draggable
          />
        </div>
      </div>
    </div>
  ) : null
}
