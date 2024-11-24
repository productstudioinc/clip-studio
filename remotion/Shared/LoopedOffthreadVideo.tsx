import { Loop, OffthreadVideo, useVideoConfig } from 'remotion'

export const LoopedOffthreadVideo: React.FC<{
  durationInSeconds: number | null
  src: string
  className?: string
  startFrom?: number
  endAt?: number
  style?: React.CSSProperties
}> = ({ durationInSeconds, src, className, startFrom, endAt, style }) => {
  const { fps } = useVideoConfig()

  if (durationInSeconds === null) {
    return null
  }

  return (
    <Loop durationInFrames={Math.floor(fps * durationInSeconds)}>
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
