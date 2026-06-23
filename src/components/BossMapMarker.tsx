import type { Boss, BossProgress } from '../types';

interface Props {
  boss: Boss;
  progress: BossProgress | undefined;
  zoom: number;
  onClick: () => void;
}

function SkullIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1a6 6 0 0 0-6 6c0 1.9.84 3.6 2.17 4.74.53.45.83 1.1.83 1.79V15h2v-1h2v1h2v-1.47c0-.69.3-1.34.83-1.79C13.16 10.6 14 8.9 14 7a6 6 0 0 0-6-6zM6 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3,8 7,12 13,5" />
    </svg>
  );
}

type MarkerState = 'none' | 'deaths' | 'defeated';

function getMarkerState(progress: BossProgress | undefined): MarkerState {
  if (!progress || progress.attempts.length === 0) return 'none';
  if (progress.defeated) return 'defeated';
  return 'deaths';
}

const MARKER_STYLES: Record<MarkerState, string> = {
  none: 'bg-canvas-soft border-2 border-hairline text-ink-faded',
  deaths: 'bg-primary border-2 border-primary text-on-vermilion shadow-[0_0_8px_rgba(196,69,58,0.5)]',
  defeated: 'bg-jade border-2 border-jade text-on-jade shadow-[0_0_8px_rgba(90,138,110,0.5)]',
};

export function BossMapMarker({ boss, progress, zoom, onClick }: Props) {
  const state = getMarkerState(progress);
  const deathCount = progress
    ? progress.attempts.filter((a) => a.type === 'death').length
    : 0;

  const stateLabel =
    state === 'defeated'
      ? 'Defeated'
      : state === 'deaths'
      ? `${deathCount} death${deathCount !== 1 ? 's' : ''}`
      : 'No attempts';

  return (
    <button
      type="button"
      aria-label={`${boss.name} — ${stateLabel}`}
      title={`${boss.name} (${stateLabel})`}
      onClick={onClick}
      className="group absolute focus-visible:outline-none"
      style={{
        left: `${boss.mapX}%`,
        top: `${boss.mapY}%`,
        transform: `translate(-50%, -50%) scale(${1 / zoom})`,
        transformOrigin: 'center center',
        willChange: 'transform',
        zIndex: state === 'none' ? 1 : 2,
      }}
    >
      {/* Marker circle */}
      <div
        className={[
          'w-9 h-9 rounded-full flex items-center justify-center relative transition-transform duration-100 group-hover:scale-110 group-focus-visible:scale-110',
          MARKER_STYLES[state],
        ].join(' ')}
      >
        {state === 'defeated' ? <CheckIcon /> : <SkullIcon />}

        {/* Death count badge */}
        {state === 'deaths' && deathCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center bg-canvas border border-primary/60 font-mono text-[10px] font-semibold text-primary leading-none"
            aria-hidden="true"
          >
            {deathCount > 99 ? '99+' : deathCount}
          </span>
        )}
      </div>

      {/* Hover label */}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 rounded bg-canvas/90 border border-hairline-dark font-sans text-[11px] text-parchment-text whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">
        {boss.name}
      </span>
    </button>
  );
}
