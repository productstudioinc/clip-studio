import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { RenderingState } from '@/types/rendering'

interface RenderingStore {
  renders: Record<string, RenderingState>
  setRenderState: (id: string, state: RenderingState) => void
  removeRender: (id: string) => void
}

export const useRenderingStore = create<RenderingStore>()(
  devtools((set) => ({
    renders: {},
    setRenderState: (id, newState) =>
      set((store) => ({
        renders: { ...store.renders, [id]: newState }
      })),
    removeRender: (id) =>
      set((store) => {
        const newRenders = { ...store.renders }
        delete newRenders[id]
        return { renders: newRenders }
      })
  }))
)
