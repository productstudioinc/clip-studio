import {
	type TwitterComponents,
	TweetBody,
	TweetContainer,
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
		<TweetContainer>
			<TweetHeader tweet={tweet} components={components} />
			<TweetBody tweet={tweet} />
			{tweet.mediaDetails?.length ? <TweetMedia tweet={tweet} components={components} /> : null}
			{/* We're not including the `TweetReplies` component that adds the reply button */}
		</TweetContainer>
	);
};
