import {
	type TwitterComponents,
	QuotedTweet,
	TweetBody,
	TweetHeader,
	TweetMedia,
	enrichTweet
} from 'react-tweet';
import type { Tweet } from 'react-tweet/api';

type Props = {
	tweet: Tweet;
	components?: TwitterComponents;
};

export const MyTweet = ({ tweet: t, components }: Props) => {
	const tweet = enrichTweet(t);
	return (
		<div className="bg-[#15202b] text-white w-full p-6 rounded-2xl">
			<TweetHeader tweet={tweet} components={components} />
			<div className="text-2xl py-2">
				<TweetBody tweet={tweet} />
			</div>
			{tweet.mediaDetails?.length ? <TweetMedia tweet={tweet} components={components} /> : null}
			{tweet.quoted_tweet && <QuotedTweet tweet={tweet.quoted_tweet} />}
			{/* We're not including the `TweetReplies` component that adds the reply button */}
		</div>
	);
};
