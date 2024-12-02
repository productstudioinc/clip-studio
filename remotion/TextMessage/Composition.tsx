import { useMemo } from 'react'
import { TextMessageVideoProps } from '@/stores/templatestore'
import { loadFont as loadRobotoFont } from '@remotion/google-fonts/Roboto'
import { AbsoluteFill, Audio, Sequence, Series, Video } from 'remotion'

import { TextMessage } from '../../components/text-message'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

const robotoFont = loadRobotoFont('normal', {
  weights: ['500']
})

const FPS = 30
const BACKGROUND_VIDEO_DURATION = 60 * FPS

export const TextMessageComposition = (props: TextMessageVideoProps) => {
  const requiredSegments = useMemo(() => {
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
        <Series>
          {requiredSegments.map((url, index) => (
            <Series.Sequence
              durationInFrames={BACKGROUND_VIDEO_DURATION}
              key={index}
            >
              <Video
                src={url}
                startFrom={0}
                endAt={BACKGROUND_VIDEO_DURATION}
                className="absolute w-full h-full object-cover"
                muted
                loop
              />
            </Series.Sequence>
          ))}
        </Series>
        <AbsoluteFill className="flex justify-center items-center">
          {props.messages.map((message, index) => {
            const startIndex = Math.max(0, index - 5)
            const visibleMessages = props.messages.slice(startIndex, index + 1)

            return (
              <Sequence
                from={message.from * FPS}
                durationInFrames={message.duration * FPS}
                key={index}
                style={{ fontFamily: robotoFont.fontFamily }}
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
