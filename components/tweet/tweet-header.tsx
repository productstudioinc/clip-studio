import { TwitterVideoProps } from '@/stores/templatestore'
import clsx from 'clsx'
import { TwitterComponents } from 'react-tweet'

import { AvatarImg } from './avatar-img'
import s from './tweet-header.module.css'

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  components?: TwitterComponents
}

export const TweetHeader = ({ tweet, components }: Props) => {
  const Img = components?.AvatarImg ?? AvatarImg
  return (
    <div className={s.header}>
      <div className={s.avatar}>
        <div className={clsx(s.avatarOverflow)}>
          <Img src={tweet.avatar} alt={tweet.username} width={48} height={48} />
        </div>
        <div className={s.avatarOverflow}>
          <div className={s.avatarShadow}></div>
        </div>
      </div>
      <div className={s.author}>
        <div className={s.authorLinkText}>
          <span title={tweet.username}>{tweet.username}</span>
        </div>
        <div className={s.authorMeta}>
          <span className={s.username} title={`@${tweet.username}`}>
            @{tweet.username}
          </span>
        </div>
      </div>
    </div>
  )
}
