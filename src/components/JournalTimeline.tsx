import { useEffect, useState } from 'react'
import type { Attempt, GifData } from '../types'

function relativeTime(ts: number): string {
  const diff  = Date.now() - ts
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins} min ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function GifLightbox({ gif, onClose }: { gif: GifData; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/92 backdrop-blur-sm"
      onClick={onClose}
      aria-label="Close GIF lightbox"
    >
      <div className="max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <img src={gif.url} alt={gif.description} className="w-full rounded-lg" />
        <p className="mt-2 text-center font-sans text-caption text-ink-faded opacity-60">
          tap anywhere to close
        </p>
      </div>
    </div>
  )
}

function SkullDot() {
  return (
    <div className="w-6 h-6 rounded-full bg-primary/15 border-2 border-primary/50 flex items-center justify-center flex-shrink-0">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="7" r="3.5" fill="#c4453a" opacity="0.85" />
        <rect x="5.5" y="9.5" width="2" height="2" rx="0.5" fill="#c4453a" opacity="0.65" />
        <rect x="8.5" y="9.5" width="2" height="2" rx="0.5" fill="#c4453a" opacity="0.65" />
      </svg>
    </div>
  )
}

function JadeDot() {
  return (
    <div className="w-6 h-6 rounded-full bg-jade/15 border-2 border-jade/50 flex items-center justify-center flex-shrink-0">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <polyline
          points="3,8.5 6.5,12 13,4.5"
          stroke="#5a8a6e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}

interface Props {
  attempts: Attempt[]
}

export function JournalTimeline({ attempts }: Props) {
  const [lightbox, setLightbox] = useState<GifData | null>(null)

  if (attempts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-zh leading-none text-parchment-text-mute opacity-20" style={{ fontSize: '3rem' }}>虛</p>
        <p className="font-display-alt italic text-ink-faded mt-3 text-[15px]">
          No tale yet told. The mountain awaits your first defeat.
        </p>
      </div>
    )
  }

  return (
    <>
      {lightbox && <GifLightbox gif={lightbox} onClose={() => setLightbox(null)} />}
      <ol aria-label="Battle journal">
        {attempts.map((attempt, i) => {
          const isDeath = attempt.type === 'death'
          const isLast  = i === attempts.length - 1

          return (
            <li key={attempt.id} className="flex gap-5">
              {/* Rail column */}
              <div className="flex flex-col items-center">
                {isDeath ? <SkullDot /> : <JadeDot />}
                {!isLast && <div className="w-0.5 flex-1 bg-primary/25 mt-1" />}
              </div>

              {/* Entry card */}
              <div className={`flex-1 min-w-0 ${isLast ? 'pb-4' : 'pb-8'}`}>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className={`font-sans text-caption-uc font-semibold tracking-[1.2px] uppercase ${isDeath ? 'text-primary' : 'text-jade'}`}>
                    {isDeath ? 'Death' : 'Vanquished'}
                  </span>
                  <span className="font-sans text-body-sm text-ink-faded">
                    {relativeTime(attempt.timestamp)}
                  </span>
                  {attempt.fightTimeMinutes && (
                    <span className="font-mono text-caption text-ink-faded">
                      {attempt.fightTimeMinutes} min
                    </span>
                  )}
                </div>

                {attempt.gif && (
                  <button
                    onClick={() => setLightbox(attempt.gif!)}
                    aria-label={`Expand GIF: ${attempt.gif.description}`}
                    className="mb-3 block rounded border border-hairline overflow-hidden hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    <img
                      src={attempt.gif.thumbnailUrl}
                      alt={attempt.gif.description}
                      loading="lazy"
                      className="max-w-[400px] max-h-[240px] w-full object-contain"
                    />
                  </button>
                )}

                {attempt.note && (
                  <p className="font-display-alt italic text-[15px] text-ink-soft leading-relaxed">
                    {attempt.note}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}
