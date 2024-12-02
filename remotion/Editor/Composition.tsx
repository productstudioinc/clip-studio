import React, { useCallback, useMemo } from 'react'
import { CaptionHopecoreComponent } from '@/remotion/Shared/caption-hopecore'
import { Caption } from '@remotion/captions'
import { TransitionSeries } from '@remotion/transitions'
import { AbsoluteFill, Audio, random, useCurrentFrame, Video } from 'remotion'

import {
  isPositionedItem,
  PositionedItem,
  type Item,
  type Track
} from '@/types/editor'

import { SortedOutlines } from '../Shared/sorted-outlines'

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
        const slowFrame = Math.floor(frame / 10)

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

const TVFrame: React.FC<{
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

const ItemComp: React.FC<{
  item: Item
}> = ({ item }) => {
  const style: React.CSSProperties = useMemo(() => {
    if (item.type === 'video' || item.type === 'solid') {
      const baseStyle: React.CSSProperties = {
        backgroundColor: item.color,
        position: 'absolute',
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`
      }

      if (item.type === 'video' && item.maintainAspectRatio) {
        // Calculate dimensions based on aspect ratio
        const currentAspectRatio = item.width / item.height
        if (currentAspectRatio > item.aspectRatio) {
          // Width is too large, adjust it
          baseStyle.width = item.height * item.aspectRatio
        } else if (currentAspectRatio < item.aspectRatio) {
          // Height is too large, adjust it
          baseStyle.height = item.width / item.aspectRatio
        }
      }

      return baseStyle
    }
    return {}
  }, [item])

  if (item.type === 'solid') {
    return (
      <AbsoluteFill>
        <CRTOverlay width={item.width} height={item.height} />
        <TVFrame width={item.width} height={item.height} />
      </AbsoluteFill>
    )
  }

  if (item.type === 'text') {
    return <div>{item.text}</div>
  }

  if (item.type === 'video') {
    return (
      <Video
        src={item.src}
        volume={item.volume}
        style={{
          ...style,
          objectFit: item.maintainAspectRatio ? 'contain' : 'fill'
        }}
      />
    )
  }

  if (item.type === 'audio') {
    return <Audio src={item.src} volume={item.volume} pauseWhenBuffering />
  }

  throw new Error(`Unknown item type: ${JSON.stringify(item)}`)
}

const Track: React.FC<{
  track: Track
}> = ({ track }) => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {track.items.map((item) => (
          <React.Fragment key={item.id}>
            <TransitionSeries.Sequence durationInFrames={item.durationInFrames}>
              <ItemComp item={item} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  )
}

type EditorCompositionProps = {
  tracks: Track[]
  captions: Caption[]
  captionStyles: React.CSSProperties
  selectedItem: string | null
  setSelectedItem: React.Dispatch<React.SetStateAction<string | null>>
  changeItem: (
    itemId: string,
    updater: (item: PositionedItem) => PositionedItem
  ) => void
}

const outer: React.CSSProperties = {
  backgroundColor: '#eee'
}

const layerContainer: React.CSSProperties = {
  overflow: 'hidden'
}

export const EditorComposition: React.FC<EditorCompositionProps> = ({
  tracks,
  captions,
  captionStyles,
  selectedItem,
  setSelectedItem,
  changeItem
}) => {
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) {
        return
      }

      setSelectedItem(null)
    },
    [setSelectedItem]
  )
  // In your component, replace the filter with:
  const positionedItems = tracks
    .flatMap((track) => track.items)
    .filter(isPositionedItem)

  return (
    <AbsoluteFill style={outer} onPointerDown={onPointerDown}>
      <AbsoluteFill style={layerContainer}>
        {tracks.map((track) => {
          return <Track track={track} key={track.name} />
        })}
      </AbsoluteFill>

      <AbsoluteFill>
        <CaptionHopecoreComponent
          captions={captions}
          styles={captionStyles}
          seed={0}
        />
      </AbsoluteFill>
      <SortedOutlines
        selectedItem={selectedItem}
        items={positionedItems}
        setSelectedItem={setSelectedItem}
        changeItem={changeItem}
      />
    </AbsoluteFill>
  )
}
