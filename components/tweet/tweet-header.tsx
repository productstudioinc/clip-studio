import { TwitterVideoProps } from '@/stores/templatestore'
import clsx from 'clsx'
import { User } from 'lucide-react'
import { TwitterComponents } from 'react-tweet'

import { AvatarImg } from './avatar-img'
import s from './tweet-header.module.css'
import { tweetTheme } from './tweet-theme'

type Props = {
  tweet: TwitterVideoProps['tweets'][number]
  components?: TwitterComponents
  mode?: 'light' | 'dark'
}

export const TweetHeader = ({ tweet, components, mode = 'dark' }: Props) => {
  const Img = components?.AvatarImg ?? AvatarImg
  const currentTheme = mode === 'dark' ? tweetTheme.dark : tweetTheme.light

  return (
    <div className={s.header} style={{ color: currentTheme.text }}>
      <div className={s.avatar}>
        <div className={clsx(s.avatarOverflow)}>
          {tweet.avatar ? (
            <Img
              src={tweet.avatar}
              alt={tweet.username}
              width={48}
              height={48}
            />
          ) : (
            <User className="w-10 h-10 flex-shrink-0" />
          )}
        </div>
      </div>
      <div className={s.author}>
        <div className={s.authorLinkText}>
          <span title={tweet.name || tweet.username}>
            {tweet.hideUsername ? '' : tweet.name || tweet.username}
          </span>
          {tweet.verified && (
            <svg
              aria-label="Verified Account"
              className="ml-1 inline h-4 w-4"
              viewBox="0 0 24 24"
              style={{ color: currentTheme.bluePrimary }}
            >
              <g fill="currentColor">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
              </g>
            </svg>
          )}
        </div>
        <div className={s.authorMeta}>
          <span
            className={s.username}
            style={{ color: currentTheme.textSecondary }}
            title={`@${tweet.username}`}
          >
            {tweet.hideUsername ? '' : `@${tweet.username}`}
          </span>
        </div>
      </div>
    </div>
  )
}
