import { useEffect, useState } from 'react';
import type { Attempt, GifData } from '../types';

type Props = {
  attempts: Attempt[];
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function DeathIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#c4453a" opacity="0.15" />
      {/* Stylised skull outline */}
      <circle cx="8" cy="7" r="3.5" fill="#c4453a" opacity="0.7" />
      <rect x="5.5" y="9.5" width="2" height="2" rx="0.5" fill="#c4453a" opacity="0.5" />
      <rect x="8.5" y="9.5" width="2" height="2" rx="0.5" fill="#c4453a" opacity="0.5" />
    </svg>
  );
}

function KillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#5a8a6e" opacity="0.15" />
      {/* Check mark */}
      <polyline
        points="4.5,8.5 7,11 11.5,5"
        stroke="#5a8a6e"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

function GifLightbox({ gif, onClose }: { gif: GifData; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/92 backdrop-blur-sm"
      onClick={onClose}
      aria-label="Close GIF lightbox"
    >
      <div className="max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={gif.url}
          alt={gif.description}
          className="w-full rounded-lg"
        />
        <p className="mt-2 text-center font-sans text-caption text-ink-faded">
          {gif.description}
        </p>
        <p className="mt-1 text-center font-sans text-caption text-ink-faded opacity-60">
          tap anywhere to close
        </p>
      </div>
    </div>
  );
}

export function AttemptTimeline({ attempts }: Props) {
  const [lightbox, setLightbox] = useState<GifData | null>(null);

  if (attempts.length === 0) {
    return (
      <p className="font-sans text-body-sm text-ink-faded italic mt-2">
        No attempts logged yet.
      </p>
    );
  }

  return (
    <>
      {lightbox && <GifLightbox gif={lightbox} onClose={() => setLightbox(null)} />}

      <ol className="flex flex-col gap-0 mt-2" aria-label="Attempt history">
        {attempts.map((attempt, i) => {
          const isDeath = attempt.type === 'death';
          return (
            <li
              key={attempt.id}
              className={[
                'flex gap-3 py-2.5',
                i < attempts.length - 1 ? 'border-b border-hairline/50' : '',
              ].join(' ')}
            >
              {/* Icon column */}
              <div className="mt-0.5 flex-shrink-0">
                {isDeath ? <DeathIcon /> : <KillIcon />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`font-sans text-caption-uc uppercase tracking-[1.2px] ${
                      isDeath ? 'text-primary' : 'text-jade'
                    }`}
                  >
                    {isDeath ? 'Death' : 'Vanquished'}
                  </span>
                  <span className="font-sans text-body-sm text-ink-faded flex-shrink-0">
                    {relativeTime(attempt.timestamp)}
                  </span>
                </div>

                {attempt.note && (
                  <p className="font-sans text-body-sm text-ink-soft mt-0.5 leading-snug">
                    {attempt.note}
                  </p>
                )}

                {attempt.gif && (
                  <button
                    onClick={() => setLightbox(attempt.gif!)}
                    aria-label={`Expand GIF: ${attempt.gif.description}`}
                    className="mt-1.5 rounded-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    <img
                      src={attempt.gif.thumbnailUrl}
                      alt={attempt.gif.description}
                      className="max-h-20 object-cover hover:opacity-90 transition-opacity"
                    />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
