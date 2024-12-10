import { useEffect, useMemo, useState } from 'react'
import { getVideoMetadata } from '@remotion/media-utils'
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Sequence,
  Series
} from 'remotion'

import { RedditCard } from '../../components/reddit-card'
import { RedditVideoProps } from '../../stores/templatestore'
import { CaptionComponent } from '../Shared/caption'
import { LoopedOffthreadVideo } from '../Shared/LoopedOffthreadVideo'

const FPS = 30
const BACKGROUND_VIDEO_DURATION = 60 * FPS

export const RedditComposition = ({
  title,
  subreddit,
  likes,
  comments,
  voiceoverUrl,
  accountName,
  titleEnd,
  backgroundUrls,
  voiceVolume,
  voiceSpeed,
  durationInFrames,
  backgroundStartIndex,
  captionStyle,
  subtitles
}: RedditVideoProps) => {
  const [handle] = useState(() =>
    delayRender('Loading video metadata', {
      timeoutInMilliseconds: 30000,
      retries: 3
    })
  )

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        await Promise.all(
          backgroundUrls.map((url) =>
            getVideoMetadata(url).catch((err) => {
              console.warn(`Failed to load metadata for ${url}:`, err)
              return null
            })
          )
        )
        continueRender(handle)
      } catch (err) {
        console.error('Error loading video metadata:', err)
        cancelRender(err)
      }
    }

    loadMetadata()

    return () => {
      continueRender(handle)
    }
  }, [backgroundUrls, handle])

  const titleEndFrame = Math.floor(titleEnd * FPS)

  const requiredSegments = useMemo(() => {
    if (backgroundUrls.length === 1) {
      return backgroundUrls
    }
    const totalMinutes = Math.ceil(durationInFrames / (FPS * 60))
    return backgroundUrls.slice(
      backgroundStartIndex,
      backgroundStartIndex + totalMinutes
    )
  }, [backgroundUrls, durationInFrames, backgroundStartIndex])

  const adjustedSubtitles = useMemo(() => {
    return subtitles.map((subtitle) => ({
      ...subtitle,
      startMs: subtitle.startMs / voiceSpeed,
      endMs: subtitle.endMs / voiceSpeed
    }))
  }, [subtitles, voiceSpeed])

  return (
    <>
      <Audio
        src={voiceoverUrl}
        pauseWhenBuffering
        volume={voiceVolume / 100}
        playbackRate={voiceSpeed}
      />
      <AbsoluteFill className="w-full h-full">
        {backgroundUrls.length === 1 ? (
          <LoopedOffthreadVideo
            src={backgroundUrls[0]}
            className="absolute w-full h-full object-cover"
          />
        ) : (
          <Series>
            {requiredSegments.map((url, index) => (
              <Series.Sequence
                durationInFrames={BACKGROUND_VIDEO_DURATION}
                key={index}
              >
                <LoopedOffthreadVideo
                  src={url}
                  className="absolute w-full h-full object-cover"
                  startFrom={0}
                  endAt={BACKGROUND_VIDEO_DURATION}
                />
              </Series.Sequence>
            ))}
          </Series>
        )}
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

          <AbsoluteFill>
            <CaptionComponent
              captions={adjustedSubtitles}
              styles={captionStyle.style}
              options={captionStyle.options}
            />
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  )
}
