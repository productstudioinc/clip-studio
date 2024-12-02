import React from 'react'
import { AbsoluteFill } from 'remotion'

export const TVFrame: React.FC<{
  width: number
  height: number
  size?: number
  borderRadius?: number
}> = ({ width, height, size: propSize, borderRadius = 205 }) => {
  const size = propSize || Math.min(width, height) * 0.9 // Use propSize if provided, otherwise calculate
  const offsetX = (width - size) / 2
  const offsetY = (height - size) / 2

  // Ensure borderRadius doesn't exceed half of the size
  const radius = Math.min(borderRadius, size / 2)

  return (
    <AbsoluteFill>
      <svg width="100%" height="100%">
        <path
          d={`
            M 0,0
            L ${width},0 
            L ${width},${height}
            L 0,${height}
            Z
            M ${offsetX + radius},${offsetY}
            Q ${offsetX},${offsetY} ${offsetX},${offsetY + radius}
            L ${offsetX},${offsetY + size - radius}
            Q ${offsetX},${offsetY + size} ${offsetX + radius},${offsetY + size}
            L ${offsetX + size - radius},${offsetY + size}
            Q ${offsetX + size},${offsetY + size} ${offsetX + size},${offsetY + size - radius}
            L ${offsetX + size},${offsetY + radius}
            Q ${offsetX + size},${offsetY} ${offsetX + size - radius},${offsetY}
            Z
          `}
          fill="black"
        />
      </svg>
    </AbsoluteFill>
  )
}
