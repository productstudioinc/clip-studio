import React from 'react'
import { useTemplateStore } from '@/stores/templatestore'

export const HopecoreForm = () => {
  const { hopeCoreState, setHopeCoreState } = useTemplateStore((state) => ({
    hopeCoreState: state.hopeCoreState,
    setHopeCoreState: state.setHopeCoreState
  }))

  return <div>HopecoreForm</div>
}
