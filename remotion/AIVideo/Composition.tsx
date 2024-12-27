import { useMemo } from 'react'
import {
  AbsoluteFill,
  Audio,
  Video,
  interpolate,
  Sequence,
  useCurrentFrame
} from 'remotion'

import { AIVideoProps } from '../../stores/templatestore'
import { CaptionComponent } from '../Shared/caption'

const FPS = 30

const VideoAnimation: React.FC<{ src: string; durationInFrames: number }> = ({
  src,
  durationInFrames
}) => {
  const frame = useCurrentFrame()
  const progress = frame / durationInFrames
  const scale = interpolate(progress, [0, 1], [1, 1.1])

  return (
    <Video
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
  voiceoverUrl,
  voiceVolume,
  videoStructure,
  subtitles
}: AIVideoProps) => {
  const videoDurations = useMemo(() => {
    return videoStructure.reduce(
      (acc, item) => {
        const startFrame = acc.length > 0 ? acc[acc.length - 1].endFrame : 0
        const durationInFrames = Math.max(
          1,
          Math.floor((item.duration || 5) * FPS)
        )
        acc.push({
          startFrame,
          endFrame: startFrame + durationInFrames,
          videoUrl: item.videoUrl,
          durationInFrames
        })
        return acc
      },
      [] as Array<{
        startFrame: number
        endFrame: number
        videoUrl: string | null
        durationInFrames: number
      }>
    )
  }, [videoStructure])

  return (
    <>
      <Audio src={voiceoverUrl} pauseWhenBuffering volume={voiceVolume / 100} />
      <AbsoluteFill>
        {videoDurations.map(
          (item, index) =>
            item.videoUrl && (
              <Sequence
                from={item.startFrame}
                durationInFrames={item.durationInFrames}
                key={`video-${index}`}
              >
                <VideoAnimation
                  src={item.videoUrl}
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
        />
        <AbsoluteFill>
          <CaptionComponent
            captions={subtitles}
            styles={captionStyle.style}
            options={captionStyle.options}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  )
}
