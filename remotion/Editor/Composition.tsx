import React, { useCallback, useMemo } from 'react'
import { Caption } from '@remotion/captions'
import { TransitionSeries } from '@remotion/transitions'
import { AbsoluteFill, Video } from 'remotion'

import type { Item, Track } from '@/types/editor'

import { CaptionComponent } from '../Shared/caption'
import { SortedOutlines } from '../Shared/sorted-outlines'

const ItemComp: React.FC<{
  item: Item
}> = ({ item }) => {
  const style: React.CSSProperties = useMemo(() => {
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
  }, [item])

  if (item.type === 'solid') {
    return <div style={style} />
  }

  if (item.type === 'text') {
    return <div style={style}>{item.text}</div>
  }

  if (item.type === 'video') {
    return (
      <Video
        src={item.src}
        style={{
          ...style,
          objectFit: item.maintainAspectRatio ? 'contain' : 'fill'
        }}
      />
    )
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
  captionStyles: { [key: string]: React.CSSProperties }
  selectedItem: string | null
  setSelectedItem: React.Dispatch<React.SetStateAction<string | null>>
  changeItem: (itemId: string, updater: (item: Item) => Item) => void
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

  const items = tracks.flatMap((track) => track.items)

  return (
    <AbsoluteFill style={outer} onPointerDown={onPointerDown}>
      <AbsoluteFill style={layerContainer}>
        {tracks.map((track) => {
          return <Track track={track} key={track.name} />
        })}
      </AbsoluteFill>

      <AbsoluteFill>
        <CaptionComponent captions={captions} styles={captionStyles} />
      </AbsoluteFill>
      <SortedOutlines
        selectedItem={selectedItem}
        items={items}
        setSelectedItem={setSelectedItem}
        changeItem={changeItem}
      />
    </AbsoluteFill>
  )
}
