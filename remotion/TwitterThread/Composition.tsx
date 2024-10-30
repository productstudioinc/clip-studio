import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  useCurrentFrame
} from 'remotion'

import { UserTweet } from '../../components/tweet/tweet'
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

  const tweetDurations = tweets.map((tweet, index) => {
    const startChar =
      index === 0
        ? 0
        : voiceoverFrames.character_end_times_seconds.findIndex(
            (time) =>
              time > voiceoverFrames.character_start_times_seconds[index]
          )
    const endChar =
      index === tweets.length - 1
        ? voiceoverFrames.character_end_times_seconds.length - 1
        : voiceoverFrames.character_start_times_seconds.findIndex(
            (time) =>
              time > voiceoverFrames.character_end_times_seconds[index + 1]
          )

    return {
      startFrame: Math.floor(
        voiceoverFrames.character_start_times_seconds[startChar] * FPS
      ),
      durationInFrames: Math.floor(
        (voiceoverFrames.character_end_times_seconds[endChar] -
          voiceoverFrames.character_start_times_seconds[startChar]) *
          FPS
      )
    }
  })

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
      <AbsoluteFill>
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

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '50%',
            background:
              'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
          }}
        />

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
        </AbsoluteFill>
        {tweets.map((tweet, index) => (
          <Sequence
            from={tweetDurations[index].startFrame}
            durationInFrames={tweetDurations[index].durationInFrames}
            key={`tweet-${index}`}
          >
            <UserTweet tweet={tweet} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </>
  )
}
