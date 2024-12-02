import React, { useCallback, useMemo } from 'react'
import { useCurrentScale, useVideoConfig } from 'remotion'

import type { PositionedItem } from '@/types/editor'

import { ResizeHandle } from '../../components/editor/resize-handle'

const SNAP_THRESHOLD = 10 // pixels

export const SelectionOutline: React.FC<{
  item: PositionedItem
  changeItem: (
    itemId: string,
    updater: (item: PositionedItem) => PositionedItem
  ) => void
  setSelectedItem: React.Dispatch<React.SetStateAction<string | null>>
  selectedItem: string | null
  isDragging: boolean
}> = ({ item, changeItem, setSelectedItem, selectedItem, isDragging }) => {
  const scale = useCurrentScale()
  const { width: compositionWidth, height: compositionHeight } =
    useVideoConfig()
  const scaledBorder = Math.ceil(2 / scale)

  const [hovered, setHovered] = React.useState(false)

  const onMouseEnter = useCallback(() => {
    setHovered(true)
  }, [])

  const onMouseLeave = useCallback(() => {
    setHovered(false)
  }, [])

  const isSelected = item.id === selectedItem

  const style: React.CSSProperties = useMemo(() => {
    return {
      width: item.width,
      height: item.height,
      left: item.left,
      top: item.top,
      position: 'absolute',
      outline:
        (hovered && !isDragging) || isSelected
          ? `${scaledBorder}px solid #0B84F3`
          : undefined,
      userSelect: 'none',
      touchAction: 'none'
    }
  }, [item, hovered, isDragging, isSelected, scaledBorder])

  const snapToCenter = useCallback(
    (position: number, itemSize: number, compositionSize: number) => {
      const center = (compositionSize - itemSize) / 2
      if (Math.abs(position - center) < SNAP_THRESHOLD) {
        return center
      }
      return position
    },
    []
  )

  const startDragging = useCallback(
    (e: PointerEvent | React.MouseEvent) => {
      const initialX = e.clientX
      const initialY = e.clientY

      const onPointerMove = (pointerMoveEvent: PointerEvent) => {
        const offsetX = (pointerMoveEvent.clientX - initialX) / scale
        const offsetY = (pointerMoveEvent.clientY - initialY) / scale
        changeItem(item.id, (i) => {
          const newLeft = Math.round(item.left + offsetX)
          const newTop = Math.round(item.top + offsetY)
          return {
            ...i,
            left: snapToCenter(newLeft, i.width, compositionWidth),
            top: snapToCenter(newTop, i.height, compositionHeight),
            isDragging: true
          }
        })
      }

      const onPointerUp = () => {
        changeItem(item.id, (i) => {
          return {
            ...i,
            isDragging: false
          }
        })
        window.removeEventListener('pointermove', onPointerMove)
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })

      window.addEventListener('pointerup', onPointerUp, {
        once: true
      })
    },
    [item, scale, changeItem, snapToCenter, compositionWidth, compositionHeight]
  )

  const onPointerDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (e.button !== 0) {
        return
      }

      setSelectedItem(item.id)
      startDragging(e)
    },
    [item.id, setSelectedItem, startDragging]
  )

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerEnter={onMouseEnter}
      onPointerLeave={onMouseLeave}
      style={style}
    >
      {isSelected ? (
        <>
          <ResizeHandle item={item} setItem={changeItem} type="top-left" />
          <ResizeHandle item={item} setItem={changeItem} type="top-right" />
          <ResizeHandle item={item} setItem={changeItem} type="bottom-left" />
          <ResizeHandle item={item} setItem={changeItem} type="bottom-right" />
        </>
      ) : null}
    </div>
  )
}
