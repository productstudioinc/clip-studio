import {
  Audio,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  useCurrentFrame
} from 'remotion'

import { MyTweet } from '../../components/tweet/my-tweet'
import { TwitterVideoProps } from '../../stores/templatestore'

const FPS = 30

export const TwitterComposition = ({
  backgroundUrls,
  tweets,
  voiceoverUrl,
  voiceoverFrames,
  voiceVolume
}: TwitterVideoProps) => {
  const frame = useCurrentFrame()

  const findDashes = (chars: string[], startIndex: number) => {
    let consecutiveDashes = 0
    for (let i = startIndex; i < chars.length; i++) {
      if (chars[i] === '-') {
        consecutiveDashes++
        if (consecutiveDashes === 5) {
          console.log(`Found 5 dashes starting at index ${i - 4}`)
          return i - 4
        }
      } else {
        consecutiveDashes = 0
      }
    }
    return -1
  }

  const tweetDurations = tweets.reduce(
    (acc, tweet, index) => {
      const startChar =
        index === 0
          ? 0
          : findDashes(voiceoverFrames.characters, acc[index - 1].endChar) + 6
      const endChar = findDashes(voiceoverFrames.characters, startChar)

      const startFrame = Math.floor(
        voiceoverFrames.character_start_times_seconds[startChar] * FPS
      )
      const durationInFrames = Math.floor(
        (voiceoverFrames.character_end_times_seconds[endChar] -
          voiceoverFrames.character_start_times_seconds[startChar]) *
          FPS
      )

      acc.push({ startFrame, durationInFrames, endChar })
      return acc
    },
    [] as { startFrame: number; durationInFrames: number; endChar: number }[]
  )

  const progress = spring({
    frame,
    fps: FPS,
    config: {
      damping: 200,
      stiffness: 100
    }
  })

  return (
    <>
      <Audio src={voiceoverUrl} volume={voiceVolume / 100} />
      <Series>
        {backgroundUrls.map((part, index) => (
          <Series.Sequence durationInFrames={60 * FPS} key={index}>
            <OffthreadVideo
              src={part}
              startFrom={0}
              endAt={60 * FPS}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              muted
            />
          </Series.Sequence>
        ))}
      </Series>

      {/* <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '50%',
            background:
              'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
          }}
        /> */}
      {/* 
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '90%',
              height: '90%',
              maxWidth: '600px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: progress
            }}
          ></div>
        </AbsoluteFill> */}
      {tweets.map((tweet, index) => (
        <Sequence
          from={tweetDurations[index].startFrame}
          durationInFrames={tweetDurations[index].durationInFrames}
          key={`tweet-${index}`}
          className="flex justify-center items-center"
        >
          <MyTweet tweet={tweet} className="h-fit" />
        </Sequence>
      ))}
    </>
  )
}
