import { useCallback, useEffect, useState } from 'react'
import { AbsoluteFill, Audio, Sequence, Series, Video } from 'remotion'

import { RedditCard } from '../../components/reddit-card'
import { RedditVideoProps } from '../../stores/templatestore'
import Subtitle from '../Shared/Subtitle'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

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
  captionStyle
}: RedditVideoProps) => {
  const [subtitles, setSubtitles] = useState<SubtitleProp[]>([])

  const generateSubtitles = useCallback(() => {
    try {
      const {
        characters,
        character_start_times_seconds,
        character_end_times_seconds
      } = voiceoverFrames
      const titleEndFrame = Math.floor(titleEnd * FPS)
      const subtitlesData: SubtitleProp[] = []
      let currentWord = ''
      let wordStartIndex = 0

      for (let i = 0; i < characters.length; i++) {
        if (characters[i] === ' ' || i === characters.length - 1) {
          if (currentWord) {
            const startFrame = Math.floor(
              character_start_times_seconds[wordStartIndex] * FPS
            )
            const endFrame = Math.floor(character_end_times_seconds[i] * FPS)

            if (startFrame > titleEndFrame) {
              subtitlesData.push({
                startFrame,
                endFrame,
                text: currentWord.trim()
              })
            }

            currentWord = ''
            wordStartIndex = i + 1
          }
        } else {
          currentWord += characters[i]
        }
      }
      setSubtitles(subtitlesData)
    } catch (e) {
      console.error('Error in generateSubtitles:', e)
    }
  }, [titleEnd, voiceoverFrames])

  useEffect(() => {
    generateSubtitles()
  }, [generateSubtitles])

  const titleEndFrame = Math.floor(titleEnd * FPS)
  return (
    <>
      <Audio src={voiceoverUrl} pauseWhenBuffering volume={voiceVolume / 100} />
      <AbsoluteFill className="w-full h-full">
        {backgroundUrls.length === 1 ? (
          <Video
            src={backgroundUrls[0]}
            className="absolute w-full h-full object-cover"
            startFrom={0}
            muted
            loop
          />
        ) : (
          <Series>
            {backgroundUrls.map((part, index) => (
              <Series.Sequence
                durationInFrames={BACKGROUND_VIDEO_DURATION}
                key={index}
              >
                <Video
                  src={part}
                  className="absolute w-full h-full object-cover"
                  startFrom={0}
                  endAt={BACKGROUND_VIDEO_DURATION}
                  muted
                  loop
                />
              </Series.Sequence>
            ))}
          </Series>
        )}
        <AbsoluteFill className="flex justify-center items-center">
          <Sequence durationInFrames={titleEndFrame}>
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
          {subtitles.map((subtitle, index) =>
            subtitle.startFrame < subtitle.endFrame ? (
              <Sequence
                from={subtitle.startFrame}
                durationInFrames={subtitle.endFrame - subtitle.startFrame}
                key={index}
              >
                <Subtitle
                  text={subtitle.text}
                  captionStyle={captionStyle}
                  style={{ top: '50%' }}
                />
              </Sequence>
            ) : null
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  )
}
