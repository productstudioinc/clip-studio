import React, { useMemo } from 'react'
import { Sequence } from 'remotion'

import type { Item } from '@/types/editor'

import { SelectionOutline } from './selection-outline'

const displaySelectedItemOnTop = (
  items: Item[],
  selectedItem: string | null
): Item[] => {
  const selectedItems = items.filter((item) => item.id === selectedItem)
  const unselectedItems = items.filter((item) => item.id !== selectedItem)

  return [...unselectedItems, ...selectedItems]
}

const CenteringLines: React.FC = () => {
  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    borderColor: '#0B84F3',
    borderStyle: 'dashed'
  }

  const verticalLineStyle: React.CSSProperties = {
    ...lineStyle,
    width: 0,
    height: '100%',
    left: '50%',
    borderLeftWidth: '2px'
  }

  const horizontalLineStyle: React.CSSProperties = {
    ...lineStyle,
    width: '100%',
    height: 0,
    top: '50%',
    borderTopWidth: '2px'
  }

  return (
    <>
      <div style={verticalLineStyle} />
      <div style={horizontalLineStyle} />
    </>
  )
}

export const SortedOutlines: React.FC<{
  items: Item[]
  selectedItem: string | null
  changeItem: (itemId: string, updater: (item: Item) => Item) => void
  setSelectedItem: React.Dispatch<React.SetStateAction<string | null>>
}> = ({ items, selectedItem, changeItem, setSelectedItem }) => {
  const itemsToDisplay = useMemo(
    () => displaySelectedItemOnTop(items, selectedItem),
    [items, selectedItem]
  )

  const isDragging = useMemo(
    () => items.some((item) => item.isDragging),
    [items]
  )

  return (
    <>
      {isDragging && <CenteringLines />}
      {itemsToDisplay.map((item) => (
        <Sequence
          key={item.id}
          from={item.from}
          durationInFrames={item.durationInFrames}
          layout="none"
        >
          <SelectionOutline
            changeItem={changeItem}
            item={item}
            setSelectedItem={setSelectedItem}
            selectedItem={selectedItem}
            isDragging={isDragging}
          />
        </Sequence>
      ))}
    </>
  )
}
