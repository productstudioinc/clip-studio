/* eslint-disable @next/next/no-img-element */
type RedditPostProps = {
	subreddit: string;
	title: string;
	accountName: string;
};

export const RedditCard: React.FC<RedditPostProps> = ({
	subreddit,
	title,
	accountName
}: RedditPostProps) => {
	return (
		<div className="bg-gray-900 text-white p-4 rounded-md shadow-md transform scale-150 w-96">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center">
					<img
						src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png"
						alt="User Avatar"
						className="w-6 h-6 rounded-full mr-2"
					/>
					<span className="text-sm text-gray-400">Posted by u/{accountName}</span>
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
		</div>
	);
};
