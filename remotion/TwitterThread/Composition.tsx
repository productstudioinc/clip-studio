import {
  AbsoluteFill,
  OffthreadVideo,
  Series,
  spring,
  useCurrentFrame
} from 'remotion'

import { Tweet } from '../../components/tweet/tweet'
import { TwitterVideoProps } from '../../stores/templatestore'

export const TwitterComposition = ({
  tweetId,
  durationInFrames,
  backgroundUrls
}: TwitterVideoProps) => {
  const frame = useCurrentFrame()
  const progress = spring({
    frame,
    fps: 30,
    config: {
      damping: 200,
      stiffness: 100
    }
  })

  if (!tweetId) {
    return null
  }

  return (
    <AbsoluteFill>
      <Series>
        {backgroundUrls.map((part, index) => (
          <Series.Sequence durationInFrames={60 * 30} key={index}>
            <OffthreadVideo
              src={part}
              startFrom={0}
              endAt={60 * 30}
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
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Tweet id={tweetId} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
