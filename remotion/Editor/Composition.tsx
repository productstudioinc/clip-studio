import React, { useCallback, useMemo } from 'react'
import { Caption } from '@remotion/captions'
import { TransitionSeries } from '@remotion/transitions'
import { AbsoluteFill, Audio, Video } from 'remotion'

import {
  isPositionedItem,
  PositionedItem,
  type Item,
  type Track
} from '@/types/editor'

import { CaptionHopecore } from '../Shared/caption-hopecore'
import { CRTOverlay } from '../Shared/crt-overlay'
import { SortedOutlines } from '../Shared/sorted-outlines'
import { TVFrame } from '../Shared/tv-frame'

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
        <CaptionHopecore captions={captions} styles={captionStyles} />
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
