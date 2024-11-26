import { useEffect, useState } from 'react'
import { getVideoMetadata } from '@remotion/media-utils'
import { Loop, OffthreadVideo, useVideoConfig } from 'remotion'

export const LoopedOffthreadVideo: React.FC<{
  src: string
  className?: string
  startFrom?: number
  endAt?: number
  style?: React.CSSProperties
}> = ({ src, className, startFrom, endAt, style }) => {
  const { fps } = useVideoConfig()
  const [videoDuration, setVideoDuration] = useState<number | null>(null)

  useEffect(() => {
    getVideoMetadata(src).then(({ durationInSeconds }) => {
      setVideoDuration(durationInSeconds)
    })
  }, [src])

  if (!videoDuration) {
    return null
  }

  return (
    <Loop durationInFrames={Math.floor(fps * videoDuration)}>
      <OffthreadVideo
        src={src}
        className={className}
        startFrom={startFrom}
        endAt={endAt}
        style={style}
        muted
      />
    </Loop>
  )
}
