import { useCallback, useEffect, useState } from 'react'
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig
} from 'remotion'

import { AIVideoProps } from '../../stores/templatestore'
import Subtitle from '../Shared/Subtitle'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

const FPS = 30

const ImageAnimation: React.FC<{ src: string; durationInFrames: number }> = ({
  src,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const progress = frame / durationInFrames
  const scale = interpolate(progress, [0, 1], [1, 1.1])

  return (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale})`,
        transition: 'transform 0.1s linear'
      }}
    />
  )
}

export const AIVideoComposition = ({
  captionStyle,
  voiceoverFrames,
  voiceoverUrl,
  voiceVolume,
  videoStructure
}: AIVideoProps) => {
  const videoConfig = useVideoConfig()
  const [subtitles, setSubtitles] = useState<SubtitleProp[]>([])
  const [handle] = useState(() => delayRender())

  const generateSubtitles = useCallback(() => {
    try {
      const {
        characters,
        character_start_times_seconds,
        character_end_times_seconds
      } = voiceoverFrames
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

            subtitlesData.push({
              startFrame,
              endFrame,
              text: currentWord.trim()
            })

            currentWord = ''
            wordStartIndex = i + 1
          }
        } else {
          currentWord += characters[i]
        }
      }
      setSubtitles(subtitlesData)
      continueRender(handle)
    } catch (e) {
      console.error('Error in generateSubtitles:', e)
      cancelRender(e)
    }
  }, [handle, voiceoverFrames])

  useEffect(() => {
    generateSubtitles()
  }, [generateSubtitles])

  // Calculate cumulative durations for image sequences
  const imageDurations = videoStructure.reduce(
    (acc, item, index) => {
      const startFrame = acc.length > 0 ? acc[acc.length - 1].endFrame : 0
      const durationInFrames = Math.floor((item.duration || 0) * FPS)
      acc.push({
        startFrame,
        endFrame: startFrame + durationInFrames,
        imageUrl: item.imageUrl,
        durationInFrames
      })
      return acc
    },
    [] as Array<{
      startFrame: number
      endFrame: number
      imageUrl: string | null
      durationInFrames: number
    }>
  )

  return (
    <>
      <Audio src={voiceoverUrl} pauseWhenBuffering volume={voiceVolume / 100} />
      <AbsoluteFill>
        {imageDurations.map(
          (item, index) =>
            item.imageUrl && (
              <Sequence
                from={item.startFrame}
                durationInFrames={item.durationInFrames}
                key={`image-${index}`}
              >
                <ImageAnimation
                  src={item.imageUrl}
                  durationInFrames={item.durationInFrames}
                />
              </Sequence>
            )
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '50%',
            background:
              'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
          }}
        ></div>
        {subtitles.map((subtitle, index) =>
          subtitle.startFrame < subtitle.endFrame ? (
            <Sequence
              from={subtitle.startFrame}
              durationInFrames={subtitle.endFrame - subtitle.startFrame}
              key={`subtitle-${index}`}
            >
              <Subtitle
                text={subtitle.text}
                captionStyle={captionStyle}
                style={{ top: '50%', position: 'absolute' }}
              />
            </Sequence>
          ) : null
        )}
      </AbsoluteFill>
    </>
  )
}
