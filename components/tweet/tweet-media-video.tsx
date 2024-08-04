'use client';
import { EnrichedQuotedTweet, EnrichedTweet, getMediaUrl, getMp4Video } from 'react-tweet';
import { MediaAnimatedGif, MediaVideo } from 'react-tweet/api';
import mediaStyles from './tweet-media.module.css';

type Props = {
	tweet: EnrichedTweet | EnrichedQuotedTweet;
	media: MediaAnimatedGif | MediaVideo;
};

export const TweetMediaVideo = ({ tweet, media }: Props) => {
	const mp4Video = getMp4Video(media);

	return (
		<video
			className={mediaStyles.image}
			poster={getMediaUrl(media, 'small')}
			autoPlay
			loop
			muted
			playsInline
			preload="auto"
		>
			<source src={mp4Video.url} type={mp4Video.content_type} />
		</video>
	);
};
