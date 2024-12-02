import React, { useMemo } from 'react'
import { AbsoluteFill, random, useCurrentFrame } from 'remotion'

export const CRTOverlay: React.FC<{
  width: number
  height: number
}> = ({ width, height }) => {
  const frame = useCurrentFrame()

  // Generate random dust particles with polygon points
  const dustParticles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        // Only change every 30 frames (about 1 second at 30fps)
        const slowFrame = Math.floor(frame / 1)

        const points = Array.from(
          { length: random(slowFrame * (i + 5)) * 3 + 3 },
          (_, j) => {
            const angle =
              (j * 2 * Math.PI) / (random(slowFrame * (i + 5)) * 3 + 3)
            const radius = random(slowFrame * (i + 4)) * 2 + 1
            return {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            }
          }
        )

        return {
          x: random(slowFrame * (i + 1)) * width,
          y: random(slowFrame * (i + 2)) * height,
          opacity: random(slowFrame * (i + 3)) * 0.2 + 0.1,
          points
        }
      }),
    [frame, width, height]
  )
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%">
        <defs>
          {/* Noise filter */}
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${0.8 + Math.sin(frame * 0.1) * 0.05}`} // Animate noise
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend mode="multiply" in2="SourceGraphic" />
          </filter>

          {/* Bigger Scanlines pattern */}
          <pattern
            id="scanlines"
            width="4"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="4" height="4" fill="rgba(0,0,0,0.3)" />
            <rect y="4" width="4" height="4" fill="transparent" />
          </pattern>

          {/* Glare/reflection gradient */}
          <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.1" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Static noise */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          filter="url(#noise)"
          opacity="0.08"
        />

        {/* Scanlines */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="url(#scanlines)"
          opacity="0.3"
        />

        {/* Dust particles */}
        {dustParticles.map((particle, i) => (
          <polygon
            key={i}
            points={particle.points
              .map((p) => `${particle.x + p.x},${particle.y + p.y}`)
              .join(' ')}
            fill="white"
            opacity={particle.opacity}
          />
        ))}

        {/* Glare/reflection */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="url(#glare)"
          opacity="0.9"
        />

        {/* Chromatic aberration simulation */}
        <g opacity="0.03">
          <rect
            x={-1}
            y={0}
            width={width}
            height={height}
            fill="red"
            opacity="0.5"
          />
          <rect
            x={1}
            y={0}
            width={width}
            height={height}
            fill="cyan"
            opacity="0.5"
          />
        </g>
      </svg>
    </AbsoluteFill>
  )
}
