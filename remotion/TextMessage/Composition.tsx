import { useEffect, useMemo, useState } from 'react'
import { TextMessageVideoProps } from '@/stores/templatestore'
import { getVideoMetadata } from '@remotion/media-utils'
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Sequence,
  Series
} from 'remotion'

import '../Shared/font.css'

import { TextMessage } from '../../components/text-message'
import { LoopedOffthreadVideo } from '../Shared/LoopedOffthreadVideo'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

const robotoFont = 'Roboto'

const FPS = 30
const BACKGROUND_VIDEO_DURATION = 60 * FPS

export const TextMessageComposition = (props: TextMessageVideoProps) => {
  const [handle] = useState(() => delayRender('Loading video metadata'))

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        await Promise.all(
          props.backgroundUrls.map((url) => getVideoMetadata(url))
        )
        continueRender(handle)
      } catch (err) {
        console.error('Error loading video metadata:', err)
        continueRender(handle)
      }
    }

    loadMetadata()
  }, [props.backgroundUrls, handle])

  const requiredSegments = useMemo(() => {
    if (props.backgroundUrls.length === 1) {
      return props.backgroundUrls
    }
    const totalMinutes = Math.ceil(props.durationInFrames / (FPS * 60))
    const totalRequiredSegments = totalMinutes
    const segments = []

    for (let i = 0; i < totalRequiredSegments; i++) {
      const segmentIndex =
        (props.backgroundStartIndex + i) % props.backgroundUrls.length
      segments.push(props.backgroundUrls[segmentIndex])
    }

    return segments
  }, [props.backgroundUrls, props.durationInFrames, props.backgroundStartIndex])

  return (
    <>
      <Audio
        src={props.voiceoverUrl}
        pauseWhenBuffering
        volume={props.voiceVolume / 100}
      />
      <AbsoluteFill className="w-full h-full">
        {props.backgroundUrls.length === 1 ? (
          <LoopedOffthreadVideo
            src={props.backgroundUrls[0]}
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
          {props.messages.map((message, index) => {
            const startIndex = Math.max(0, index - 5)
            const visibleMessages = props.messages.slice(startIndex, index + 1)

            return (
              <Sequence
                from={message.from * FPS}
                durationInFrames={message.duration * FPS}
                key={index}
                style={{ fontFamily: robotoFont }}
              >
                <AbsoluteFill className="flex justify-center items-center">
                  <TextMessage
                    {...props}
                    messages={visibleMessages}
                    className="max-w-lg"
                  />
                </AbsoluteFill>
              </Sequence>
            )
          })}
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  )
}
