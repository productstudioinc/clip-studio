import { useState } from 'react'
import { TextMessageVideoProps } from '@/stores/templatestore'
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  Series
} from 'remotion'

import { TextMessage } from '../../components/text-message'
import { Audio } from 'remotion'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

const FPS = 30
const BACKGROUND_VIDEO_DURATION = 60 * FPS

export const TextMessageComposition = (props: TextMessageVideoProps) => {
  return (
    <>
      <Audio
        src={props.voiceoverUrl}
        pauseWhenBuffering
        volume={props.voiceVolume / 100}
      />
      <AbsoluteFill className="w-full h-full">
        <Series>
          {props.backgroundUrls.map((part, index) => (
            <Series.Sequence
              durationInFrames={BACKGROUND_VIDEO_DURATION}
              key={index}
            >
              <OffthreadVideo
                src={part}
                startFrom={0}
                endAt={BACKGROUND_VIDEO_DURATION}
                className="absolute w-full h-full object-cover"
                muted
              />
            </Series.Sequence>
          ))}
        </Series>
        <AbsoluteFill className="flex justify-center items-center">
          {props.messages.map((message, index) => (
            <Sequence from={index * 100} durationInFrames={100} key={index}>
              <AbsoluteFill className="flex justify-center items-center">
                <TextMessage
                  {...props}
                  messages={props.messages.slice(0, index + 1)}
                  className="max-w-lg"
                />
              </AbsoluteFill>
            </Sequence>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  )
}
