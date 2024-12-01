import React from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export const SpeedSelection: React.FC<{
  playbackRate: number
  setPlaybackRate: (rate: number) => void
}> = ({ playbackRate, setPlaybackRate }) => {
  const handleSpeedChange = (value: string) => {
    const newRate = parseFloat(value)
    setPlaybackRate(newRate)
  }

  return (
    <Select onValueChange={handleSpeedChange} value={playbackRate.toString()}>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="Playback Speed" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0.5">0.5x</SelectItem>
        <SelectItem value="0.75">0.75x</SelectItem>
        <SelectItem value="1">1x</SelectItem>
        <SelectItem value="1.25">1.25x</SelectItem>
        <SelectItem value="1.5">1.5x</SelectItem>
        <SelectItem value="2">2x</SelectItem>
      </SelectContent>
    </Select>
  )
}
