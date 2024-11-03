import { TwitterVideoProps } from '@/stores/templatestore'
import clsx from 'clsx'
import { TwitterComponents } from 'react-tweet'
import { MediaDetails } from 'react-tweet/api'

import { MediaImg } from './media-img'
import s from './tweet-media.module.css'

const getSkeletonStyle = (media: MediaDetails, itemCount: number) => {
  let paddingBottom = 56.25 // default of 16x9

  if (itemCount === 1)
    paddingBottom =
      (100 / media.original_info.width) * media.original_info.height

  // if we have 2 items, double the default to be 16x9 total
  if (itemCount === 2) paddingBottom = paddingBottom * 2

  return {
    width: media.type === 'photo' ? undefined : 'unset',
    paddingBottom: `${paddingBottom}%`
  }
}

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  components?: TwitterComponents
  quoted?: boolean
}

export const TweetMedia = ({ tweet, components, quoted }: Props) => {
  const Img = components?.MediaImg ?? MediaImg

  return tweet.image ? (
    <div className={clsx(s.root, !quoted && s.rounded)}>
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
