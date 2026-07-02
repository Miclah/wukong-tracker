import { useEffect, useMemo } from 'react'

interface Props {
  onComplete: () => void
}

const PARTICLE_COUNT = 24
const SPLATTER_COUNT = 14

function InkParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3
        const distance = 120 + Math.random() * 220
        return {
          id: i,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          size: 4 + Math.random() * 10,
          delay: Math.random() * 120,
        }
      }),
    [],
  )

  return (
    <>
      {particles.map((p) => (
        <span
          key={p.id}
          className="vanquish-ink-particle"
          style={
            {
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}ms`,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  )
}

function WaxSplatter() {
  const dots = useMemo(
    () =>
      Array.from({ length: SPLATTER_COUNT }, (_, i) => {
        const angle = (i / SPLATTER_COUNT) * Math.PI * 2
        const r = 70 + Math.random() * 50
        return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, size: 3 + Math.random() * 5 }
      }),
    [],
  )

  return (
    <svg
      width="1"
      height="1"
      style={{ overflow: 'visible', position: 'absolute' }}
      aria-hidden="true"
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.size}
          fill="#c4453a"
          className="vanquish-splatter-dot"
          style={{ animationDelay: `${300 + i * 15}ms` }}
        />
      ))}
    </svg>
  )
}

// First-vanquish celebration: image dissolves into ink particles, a large
// 勝 (victory) character stamps down center-screen with a wax-splatter burst.
export function VanquishRitual({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1500)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Boss vanquished"
      className="fixed inset-0 z-[200] flex items-center justify-center select-none"
      onClick={onComplete}
    >
      <div className="absolute inset-0 bg-canvas vanquish-ritual-wash" />
      <div className="relative flex items-center justify-center">
        <InkParticles />
        <div className="vanquish-stamp-drop relative flex items-center justify-center">
          <WaxSplatter />
          <span
            className="font-zh font-bold text-primary vanquish-char"
            style={{ fontSize: '9rem', lineHeight: 1 }}
          >
            勝
          </span>
        </div>
      </div>
    </div>
  )
}
