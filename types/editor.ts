interface BaseItem {
  id: string
  type: string
  durationInFrames: number
  from: number
}

// Define positioned item properties
interface PositionedItemProperties {
  left: number
  top: number
  width: number
  height: number
  color: string
  rotation: number
  isDragging: boolean
}

// Redefine your item types with proper discrimination
interface VideoItem extends BaseItem, PositionedItemProperties {
  type: 'video'
  src: string
  volume: number
  maintainAspectRatio: boolean
  aspectRatio: number
}

interface SolidItem extends BaseItem, PositionedItemProperties {
  type: 'solid'
}

interface TextItem extends BaseItem, PositionedItemProperties {
  type: 'text'
  text: string
}

interface AudioItem extends BaseItem {
  type: 'audio'
  src: string
  volume: number
}

// Create the union type
export type Item = VideoItem | SolidItem | TextItem | AudioItem
export type PositionedItem = VideoItem | SolidItem | TextItem

export type Track = {
  name: string
  items: Item[]
  visible?: boolean
  muted?: boolean
  volume?: number
}

// Type predicate function
export function isPositionedItem(item: Item): item is PositionedItem {
  return item.type === 'video' || item.type === 'solid' || item.type === 'text'
}
