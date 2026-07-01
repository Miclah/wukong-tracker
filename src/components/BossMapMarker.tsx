import type { Boss, BossProgress } from '../types';
import { MarkerUndefeated } from './markers/MarkerUndefeated';
import { MarkerDefeated } from './markers/MarkerDefeated';
import { MarkerUntouched } from './markers/MarkerUntouched';

interface Props {
  boss: Boss;
  progress: BossProgress | undefined;
  zoom: number;
  onClick: () => void;
}

type MarkerState = 'none' | 'deaths' | 'defeated';

function getMarkerState(progress: BossProgress | undefined): MarkerState {
  if (!progress || progress.attempts.length === 0) return 'none';
  if (progress.defeated) return 'defeated';
  return 'deaths';
}

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
      <div className="transition-transform duration-100 group-hover:scale-110 group-focus-visible:scale-110">
        {state === 'none'    && <MarkerUntouched />}
        {state === 'deaths'  && <MarkerUndefeated deathCount={deathCount} />}
        {state === 'defeated' && <MarkerDefeated />}
      </div>

      {/* Hover label */}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 rounded bg-canvas/90 border border-hairline-dark font-sans text-[11px] text-parchment-text whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">
        {boss.name}
      </span>
    </button>
  );
}
