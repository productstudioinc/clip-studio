import clsx from 'clsx'
import { EnrichedTweet, TwitterComponents } from 'react-tweet'

import { AvatarImg } from './avatar-img'
import s from './tweet-header.module.css'

type Props = {
  tweet: EnrichedTweet
  components?: TwitterComponents
}

export const TweetHeader = ({ tweet, components }: Props) => {
  const Img = components?.AvatarImg ?? AvatarImg
  const { user } = tweet

  return (
    <div className={s.header}>
      <a
        href={tweet.url}
        className={s.avatar}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div
          className={clsx(
            s.avatarOverflow,
            user.profile_image_shape === 'Square' && s.avatarSquare
          )}
        >
          <Img
            src={user.profile_image_url_https}
            alt={user.name}
            width={48}
            height={48}
          />
        </div>
        <div className={s.avatarOverflow}>
          <div className={s.avatarShadow}></div>
        </div>
      </a>
      <div className={s.author}>
        <a
          href={tweet.url}
          className={s.authorLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={s.authorLinkText}>
            <span title={user.name}>{user.name}</span>
          </div>
        </a>
        <div className={s.authorMeta}>
          <a
            href={tweet.url}
            className={s.username}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span title={`@${user.screen_name}`}>@{user.screen_name}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
