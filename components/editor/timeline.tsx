import React, { useState } from 'react'
import { Caption } from '@remotion/captions'
import { Eye, EyeOff } from 'lucide-react'

import { Item, Track } from '@/types/editor'

export const Timeline: React.FC<{
  captions: Caption[]
  tracks: Track[]
  setTracks: (tracks: Track[]) => void
  currentFrame: number
  onSeek: (frame: number) => void
  durationInFrames: number
  onTrackVisibilityChange?: (trackIndex: number) => void
}> = ({
  captions,
  tracks,
  setTracks,
  currentFrame,
  onSeek,
  durationInFrames,
  onTrackVisibilityChange
}) => {
  const [draggingItem, setDraggingItem] = useState<Item | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartFrom, setDragStartFrom] = useState(0)
  const [dragStartDuration, setDragStartDuration] = useState(0)
  const [resizeType, setResizeType] = useState<'start' | 'end' | null>(null)
  const [dragTime, setDragTime] = useState<string | null>(null)

  const handleDragStart = (
    e: React.MouseEvent,
    item: Item,
    type: 'move' | 'start' | 'end'
  ) => {
    setDraggingItem(item)
    setDragStartX(e.clientX)
    setDragStartFrom(item.from)
    setDragStartDuration(item.durationInFrames)
    setResizeType(type === 'move' ? null : type)
  }

  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingItem) return

    const deltaX = e.clientX - dragStartX
    const deltaFrames = Math.round(
      (deltaX / e.currentTarget.clientWidth) * durationInFrames
    )

    let newFrom = dragStartFrom
    let newDuration = dragStartDuration

    if (resizeType === 'start') {
      newFrom = Math.max(0, dragStartFrom + deltaFrames)
      newDuration = Math.max(1, dragStartDuration - deltaFrames)
    } else if (resizeType === 'end') {
      newDuration = Math.max(1, dragStartDuration + deltaFrames)
    } else {
      newFrom = Math.max(0, dragStartFrom + deltaFrames)
    }

    const timeInSeconds = newFrom / 60 // Assuming 60 fps
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    const frames = Math.floor((timeInSeconds % 1) * 60)
    setDragTime(
      `${minutes}:${seconds.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`
    )

    setTracks(
      tracks.map((track) => ({
        ...track,
        items: track.items.map((item) =>
          item.id === draggingItem.id
            ? { ...item, from: newFrom, durationInFrames: newDuration }
            : item
        )
      }))
    )
  }

  const handleDragEnd = () => {
    setDraggingItem(null)
    setResizeType(null)
    setDragTime(null)
  }

  return (
    <div className="mt-4 relative overflow-x-auto">
      {dragTime && (
        <div className="absolute top-0 left-0 bg-background text-foreground px-2 py-1 rounded z-10">
          {dragTime}
        </div>
      )}
      <div
        className="absolute top-0 left-0 w-0.5 h-full bg-primary z-10"
        style={{ left: `${(currentFrame / durationInFrames) * 100}%` }}
      />
      <div className="min-w-full inline-block">
        {tracks.map((track, trackIndex) => (
          <div
            key={track.name}
            className="flex items-center border-b border-border py-2"
          >
            <div className="w-32 px-4 font-medium text-sm whitespace-nowrap text-muted-foreground absolute z-10 select-none flex items-center gap-2">
              <button
                onClick={() => onTrackVisibilityChange?.(trackIndex)}
                className="hover:text-foreground"
              >
                {track.visible === false ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              {track.name}
            </div>
            <div
              className="flex-1 relative h-12 bg-muted rounded"
              style={{ minWidth: '500px' }}
              onMouseMove={handleDrag}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const newFrame = Math.round(
                  (clickX / rect.width) * durationInFrames
                )
                onSeek(newFrame)
              }}
            >
              {track.items.map((item) => {
                const startPercent = (item.from / durationInFrames) * 100
                const widthPercent =
                  (item.durationInFrames / durationInFrames) * 100
                return (
                  <div
                    key={item.id}
                    className="absolute top-0 h-full rounded cursor-move hover:brightness-95 group"
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor:
                        item.type === 'solid'
                          ? item.color
                          : item.type === 'text'
                            ? '#4CAF50'
                            : item.type === 'audio'
                              ? '#FF9800'
                              : '#2196F3',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor:
                        item.type === 'solid'
                          ? item.color
                          : item.type === 'text'
                            ? '#388E3C'
                            : item.type === 'audio'
                              ? '#F57C00'
                              : '#1976D2'
                    }}
                    onMouseDown={(e) => handleDragStart(e, item, 'move')}
                  >
                    <div className="px-2 text-xs text-primary-foreground truncate h-full flex items-center">
                      {item.type === 'text'
                        ? item.text
                        : item.type === 'video'
                          ? 'Video'
                          : item.type === 'audio'
                            ? 'Audio'
                            : 'Solid'}
                    </div>
                    <div
                      className="absolute left-0 top-0 w-1 h-full bg-background opacity-0 group-hover:opacity-50 cursor-w-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleDragStart(e, item, 'start')
                      }}
                    />
                    <div
                      className="absolute right-0 top-0 w-1 h-full bg-background opacity-0 group-hover:opacity-50 cursor-e-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleDragStart(e, item, 'end')
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {/* Caption visualization */}
        <div className="flex items-center border-b border-border py-2">
          <div className="w-32 px-4 font-medium text-sm whitespace-nowrap text-muted-foreground absolute z-10">
            Captions
          </div>
          <div
            className="flex-1 relative h-12 bg-muted rounded"
            style={{ minWidth: '500px' }}
          >
            {captions.map((caption, index) => {
              const startPercent =
                (caption.startMs / ((durationInFrames * 1000) / 60)) * 100
              const widthPercent =
                ((caption.endMs - caption.startMs) /
                  ((durationInFrames * 1000) / 60)) *
                100

              return (
                <div
                  key={index}
                  className="absolute top-0 h-full rounded bg-purple-500 opacity-70 pointer-events-none border border-purple-700"
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`
                  }}
                >
                  <div className="px-2 text-xs text-primary-foreground truncate h-full flex items-center">
                    {caption.text}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
