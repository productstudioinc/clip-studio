import { Audio, OffthreadVideo, Sequence, Series } from 'remotion'

import { MyTweet } from '../../components/tweet/my-tweet'
import { TwitterVideoProps } from '../../stores/templatestore'

const FPS = 30

export const TwitterComposition = ({
  backgroundUrls,
  tweets,
  voiceoverUrl,
  voiceVolume
}: TwitterVideoProps) => {
  return (
    <>
      <Audio src={voiceoverUrl} volume={voiceVolume / 100} />
      <Series>
        {backgroundUrls.map((part, index) => (
          <Series.Sequence durationInFrames={60 * FPS} key={index}>
            <OffthreadVideo
              src={part}
              startFrom={0}
              endAt={60 * FPS}
              className="absolute w-full h-full object-cover"
              muted
            />
          </Series.Sequence>
        ))}
      </Series>
      {tweets.map((tweet, index) => (
        <Sequence
          from={Math.floor((tweets[index].from || 0) * FPS)}
          durationInFrames={Math.floor((tweets[index].duration || 0) * FPS)}
          key={`tweet-${index}`}
          className="flex justify-center items-center"
        >
          <MyTweet tweet={tweet} className="h-fit" />
        </Sequence>
      ))}
    </>
  )
}
