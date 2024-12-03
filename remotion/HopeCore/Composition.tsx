import { useMemo, useState } from 'react'
import { Caption } from '@remotion/captions'
import { AbsoluteFill, Audio, Sequence, Series, Video } from 'remotion'

import { HopeCoreVideoProps } from '../../stores/templatestore'
import { CaptionHopecore } from '../Shared/caption-hopecore'
import { CRTOverlay } from '../Shared/crt-overlay'
import Subtitle from '../Shared/Subtitle'
import { TVFrame } from '../Shared/tv-frame'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

const FPS = 30
const BACKGROUND_VIDEO_DURATION = 60 * FPS
const captions: Caption[] = [
  {
    text: 'Using',
    startMs: 0,
    endMs: 500,
    timestampMs: 250,
    confidence: null
  },
  {
    text: ' clip studio',
    startMs: 500,
    endMs: 1000,
    timestampMs: 750,
    confidence: null
  },
  {
    text: ' you ',
    startMs: 1000,
    endMs: 1250,
    timestampMs: 1125,
    confidence: null
  },
  {
    text: ' can ',
    startMs: 1250,
    endMs: 1500,
    timestampMs: 1375,
    confidence: null
  },
  {
    text: ' make ',
    startMs: 1500,
    endMs: 2000,
    timestampMs: 1750,
    confidence: null
  },
  {
    text: ' some',
    startMs: 2000,
    endMs: 2500,
    timestampMs: 2250,
    confidence: null
  },
  {
    text: ' dope',
    startMs: 2500,
    endMs: 3000,
    timestampMs: 2750,
    confidence: null
  },
  {
    text: ' videos',
    startMs: 3000,
    endMs: 3500,
    timestampMs: 3250,
    confidence: null
  }
]

export const HopeCoreComposition = ({
  voiceoverUrl,
  musicUrl,
  musicVolume,
  // voiceoverFrames,
  backgroundUrls,
  voiceVolume,
  captionStyle,
  voiceSpeed,
  durationInFrames,
  width,
  height,
  backgroundStartIndex
}: HopeCoreVideoProps) => {
  const [subtitles, setSubtitles] = useState<SubtitleProp[]>([])

  const requiredSegments = useMemo(() => {
    const totalMinutes = Math.ceil(durationInFrames / (FPS * 60))
    return (backgroundUrls ?? []).slice(
      backgroundStartIndex,
      backgroundStartIndex + totalMinutes
    )
  }, [backgroundUrls, durationInFrames, backgroundStartIndex])

  return (
    <>
      {musicUrl && (
        <Audio
          src={musicUrl}
          volume={musicVolume / 100}
          loop
          playbackRate={1}
        />
      )}
      {voiceoverUrl && (
        <Audio
          src={voiceoverUrl}
          pauseWhenBuffering
          volume={voiceVolume / 100}
          playbackRate={voiceSpeed}
        />
      )}
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
          {subtitles.map((subtitle, index) => {
            const durationInFrames = Math.floor(
              (subtitle.endFrame - subtitle.startFrame) / voiceSpeed
            )
            const safeDurationInFrames = Math.max(1, durationInFrames)
            return subtitle.startFrame < subtitle.endFrame ? (
              <Sequence
                from={Math.floor(subtitle.startFrame / voiceSpeed)}
                durationInFrames={safeDurationInFrames}
                key={index}
              >
                <Subtitle
                  text={subtitle.text}
                  captionStyle={captionStyle}
                  style={{ top: '50%' }}
                />
              </Sequence>
            ) : null
          })}
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill>
        <CRTOverlay width={width} height={height} />
        <TVFrame width={width} height={height} />
      </AbsoluteFill>
      <CaptionHopecore captions={captions} />
    </>
  )
}
