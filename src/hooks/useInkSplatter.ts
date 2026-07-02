import { useCallback, useState } from 'react'

export interface Splatter {
  id: number
  x: number
  y: number
}

let splatterCounter = 0

// Spawns a tiny ink-splatter burst at the click point; each splatter
// removes itself after its fade-out animation completes.
export function useInkSplatter() {
  const [splatters, setSplatters] = useState<Splatter[]>([])

  const onPointerDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = ++splatterCounter
    setSplatters((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => {
      setSplatters((prev) => prev.filter((s) => s.id !== id))
    }, 400)
  }, [])

  return { splatters, onPointerDown }
}
