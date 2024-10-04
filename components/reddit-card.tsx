/* eslint-disable @next/next/no-img-element */
type RedditPostProps = {
  subreddit: string
  title: string
  accountName: string
  likes: number
  comments: number
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'

  return num.toString()
}

export const RedditCard: React.FC<RedditPostProps> = ({
  subreddit,
  title,
  accountName,
  likes,
  comments
}: RedditPostProps) => {
  return (
    <div className="bg-white text-black p-4 rounded-md shadow-md transform scale-150 w-96">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <img
            src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png"
            alt="User Avatar"
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-400">@{accountName}</span>
        </div>
        <div className="flex items-center space-x-1">
          <img
            src="https://www.redditstatic.com/gold/awards/icon/platinum_256.png"
            alt="Platinum"
            className="w-4 h-4"
          />
          <img
            src="https://www.redditstatic.com/gold/awards/icon/gold_256.png"
            alt="Gold"
            className="w-4 h-4"
          />
          <img
            src="https://www.redditstatic.com/gold/awards/icon/silver_256.png"
            alt="Silver"
            className="w-4 h-4"
          />
        </div>
      </div>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="text-gray-500 text-sm mt-2">r/{subreddit}</div>
      <div className="flex justify-between text-gray-500 text-sm mt-2">
        <span>↑ {formatNumber(likes)}</span>
        <span>💬 {formatNumber(comments)}</span>
      </div>
    </div>
  )
}
