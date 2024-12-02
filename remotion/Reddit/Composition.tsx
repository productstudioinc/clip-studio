import { useCallback, useEffect, useMemo, useState } from 'react'
import { AbsoluteFill, Audio, Sequence, Series, Video } from 'remotion'

import { RedditCard } from '../../components/reddit-card'
import { RedditVideoProps } from '../../stores/templatestore'
import { CaptionComponent } from '../Shared/caption'

const FPS = 30
const BACKGROUND_VIDEO_DURATION = 60 * FPS

export const RedditComposition = ({
  title,
  subreddit,
  likes,
  comments,
  voiceoverUrl,
  voiceoverFrames,
  accountName,
  titleEnd,
  backgroundUrls,
  voiceVolume,
  captionStyle,
  voiceSpeed,
  durationInFrames,
  backgroundStartIndex,
  captions
}: RedditVideoProps) => {
  const titleEndFrame = Math.floor(titleEnd * FPS)

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
        pauseWhenBuffering
        volume={voiceVolume / 100}
        playbackRate={voiceSpeed}
      />
      <AbsoluteFill className="w-full h-full">
        <Series>
          {requiredSegments.map((url, index) => (
            <Series.Sequence
              durationInFrames={BACKGROUND_VIDEO_DURATION}
              key={index}
            >
              <Video
                src={url}
                className="absolute w-full h-full object-cover"
                startFrom={0}
                endAt={BACKGROUND_VIDEO_DURATION}
                muted
                loop
              />
            </Series.Sequence>
          ))}
        </Series>
        <AbsoluteFill className="flex justify-center items-center">
          <Sequence durationInFrames={Math.floor(titleEndFrame / voiceSpeed)}>
            <AbsoluteFill className="flex justify-center items-center">
              <RedditCard
                title={title}
                subreddit={subreddit}
                accountName={accountName}
                likes={likes}
                comments={comments}
              />
            </AbsoluteFill>
          </Sequence>
          <CaptionComponent captions={captions} styles={captionStyle} />
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  )
}
