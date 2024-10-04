import React from 'react'
import { spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { cn } from '../../lib/utils'
import { CaptionStyle } from '../../stores/templatestore'
import { Word } from './Word'

const Subtitle: React.FC<{
  text: string
  captionStyle: CaptionStyle
  className?: string
  style?: React.CSSProperties
}> = ({ text, captionStyle, className, style }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200
    },
    durationInFrames: 5
  })

  return (
    <div className={cn('w-full absolute', className)} style={style}>
      <Word
        stroke
        enterProgress={enter}
        text={text}
        captionStyle={captionStyle}
      />
      <Word enterProgress={enter} text={text} captionStyle={captionStyle} />
    </div>
  )
}

export default Subtitle
