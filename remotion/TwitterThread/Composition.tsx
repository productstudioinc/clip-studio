import { useEffect, useMemo, useState } from 'react'
import { getVideoMetadata } from '@remotion/media-utils'
import { Audio, continueRender, delayRender, Sequence, Series } from 'remotion'

import { MyTweet } from '../../components/tweet/my-tweet'
import { TwitterVideoProps } from '../../stores/templatestore'
import { LoopedOffthreadVideo } from '../Shared/LoopedOffthreadVideo'

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
  const [handle] = useState(() => delayRender('Loading video metadata'))

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        await Promise.all(backgroundUrls.map((url) => getVideoMetadata(url)))
        continueRender(handle)
      } catch (err) {
        console.error('Error loading video metadata:', err)
        continueRender(handle)
      }
    }

    loadMetadata()
  }, [backgroundUrls, handle])

  const requiredSegments = useMemo(() => {
    if (backgroundUrls.length === 1) {
      return backgroundUrls
    }
    const totalMinutes = Math.ceil(durationInFrames / (FPS * 60))
    const totalRequiredSegments = totalMinutes
    const segments = []

    for (let i = 0; i < totalRequiredSegments; i++) {
      const segmentIndex = (backgroundStartIndex + i) % backgroundUrls.length
      segments.push(backgroundUrls[segmentIndex])
    }

    return segments
  }, [backgroundUrls, durationInFrames, backgroundStartIndex])

  return (
    <>
      <Audio
        src={voiceoverUrl}
        volume={voiceVolume / 100}
        playbackRate={voiceSpeed}
      />
      {backgroundUrls.length === 1 ? (
        <LoopedOffthreadVideo
          src={backgroundUrls[0]}
          className="absolute w-full h-full object-cover"
        />
      ) : (
        <Series>
          {requiredSegments.map((url, index) => (
            <Series.Sequence durationInFrames={60 * FPS} key={index}>
              <LoopedOffthreadVideo
                src={url}
                className="absolute w-full h-full object-cover"
                startFrom={0}
                endAt={60 * FPS}
              />
            </Series.Sequence>
          ))}
        </Series>
      )}
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
