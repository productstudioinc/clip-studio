type BaseItem = {
  from: number
  durationInFrames: number
  id: string
}

export type SolidItem = BaseItem & {
  type: 'solid'
  color: string
  height: number
  left: number
  top: number
  width: number
  rotation: number
  isDragging: boolean
}

export type TextItem = BaseItem & {
  type: 'text'
  text: string
  color: string
}

export type VideoItem = BaseItem & {
  type: 'video'
  src: string
  volume: number
  height: number
  left: number
  top: number
  width: number
  color: string
  rotation: number
  isDragging: boolean
  aspectRatio: number
  maintainAspectRatio: boolean
}

export type AudioItem = BaseItem & {
  type: 'audio'
  src: string
  volume: number
}

export type Item = SolidItem | TextItem | VideoItem | AudioItem

export type Track = {
  name: string
  items: Item[]
}
