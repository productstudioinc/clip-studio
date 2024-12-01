import { useMemo } from 'react'
import { Audio, Sequence, Series, Video } from 'remotion'

import { MyTweet } from '../../components/tweet/my-tweet'
import { TwitterVideoProps } from '../../stores/templatestore'

const FPS = 30

export const TwitterComposition = ({
  backgroundUrls,
  durationInFrames,
  backgroundStartIndex,
  tweets,
  voiceoverUrl,
  voiceVolume,
  voiceSpeed,
  mode
}: TwitterVideoProps) => {
  const requiredSegments = useMemo(() => {
    const totalMinutes = Math.ceil(durationInFrames / (FPS * 60))
    return backgroundUrls.slice(
      backgroundStartIndex,
      backgroundStartIndex + totalMinutes
    )
  }, [backgroundUrls, durationInFrames, backgroundStartIndex])

  return (
    <>
      <Audio
        src={voiceoverUrl}
        volume={voiceVolume / 100}
        playbackRate={voiceSpeed}
      />
      <Series>
        {requiredSegments.map((url, index) => (
          <Series.Sequence durationInFrames={60 * FPS} key={index}>
            <Video
              src={url}
              startFrom={0}
              endAt={60 * FPS}
              className="absolute w-full h-full object-cover"
              muted
              loop
            />
          </Series.Sequence>
        ))}
      </Series>
      {tweets.map((tweet, index) => (
        <Sequence
          from={Math.floor(((tweets[index].from || 0) * FPS) / voiceSpeed)}
          durationInFrames={Math.floor(
            ((tweets[index].duration || 0) * FPS) / voiceSpeed
          )}
          key={`tweet-${index}`}
          className="flex justify-center items-center"
        >
          <MyTweet tweet={tweet} className="h-fit" mode={mode} />
        </Sequence>
      ))}
    </>
  )
}
