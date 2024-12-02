import React from 'react'
import { HopelessCoreVideoProps } from '@/stores/templatestore'
import { AbsoluteFill } from 'remotion'

export const HopelessCoreComposition: React.FC<HopelessCoreVideoProps> = (
  props
) => {
  return (
    <AbsoluteFill className="bg-black">
      <div className="flex flex-col items-center justify-center h-full text-white p-8">
        <h1 className="text-4xl font-bold mb-4">{props.title}</h1>
        <p className="text-xl text-center">{props.content}</p>
      </div>
    </AbsoluteFill>
  )
}
