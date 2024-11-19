'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function Confetti() {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: {
        x: 0.5,
        y: 0.5
      }
    })
  }, [])
  return null
}
