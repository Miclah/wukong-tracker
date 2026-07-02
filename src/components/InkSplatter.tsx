import type { Splatter } from '../hooks/useInkSplatter'

const DOT_COUNT = 4

// Renders inside a `relative overflow-hidden` container alongside useInkSplatter.
export function InkSplatterLayer({ splatters }: { splatters: Splatter[] }) {
  return (
    <>
      {splatters.map((s) => (
        <span
          key={s.id}
          className="ink-splatter-burst"
          style={{ left: s.x, top: s.y }}
          aria-hidden="true"
        >
          {Array.from({ length: DOT_COUNT }, (_, i) => {
            const angle = (i / DOT_COUNT) * Math.PI * 2 + Math.PI / 4
            const dist = 8 + (i % 2) * 4
            return (
              <i
                key={i}
                className="ink-splatter-dot"
                style={
                  {
                    '--dx': `${Math.cos(angle) * dist}px`,
                    '--dy': `${Math.sin(angle) * dist}px`,
                    animationDelay: `${i * 20}ms`,
                  } as React.CSSProperties
                }
              />
            )
          })}
        </span>
      ))}
    </>
  )
}
