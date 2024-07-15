interface RedditPostProps {
  subreddit: string;
  title: string;
}

export const RedditCard: React.FC<RedditPostProps> = ({ subreddit, title }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-md shadow-md transform scale-150 w-96">
      <div className="text-gray-500 text-sm">r/{subreddit}</div>
      <h2 className="text-lg font-bold mt-2">{title}</h2>
    </div>
  );
};
