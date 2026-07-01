import { useState, useRef } from 'react';
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

const TYPE_LABELS: Record<string, string> = {
  'yaoguai-king':  'Yaoguai King',
  'yaoguai-chief': 'Yaoguai Chief',
  'elite-yaoguai': 'Elite Yaoguai',
  'hidden':        'Hidden Boss',
  'final':         'Final Boss',
};

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

  const [showPreview, setShowPreview] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelLongPress = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = () => {
    cancelLongPress();
    longPressTimer.current = setTimeout(() => setShowPreview(true), 500);
  };

  const handleTouchEnd = () => {
    cancelLongPress();
    if (showPreview) {
      setTimeout(() => setShowPreview(false), 2000);
    }
  };

  const stateLabel =
    state === 'defeated'
      ? 'Defeated'
      : state === 'deaths'
      ? `${deathCount} death${deathCount !== 1 ? 's' : ''}`
      : 'No attempts';

  const focalX = boss.focalPoint ? boss.focalPoint.x * 100 : 50;
  const focalY = boss.focalPoint ? boss.focalPoint.y * 100 : 30;

  return (
    <button
      type="button"
      aria-label={`${boss.name} — ${stateLabel}`}
      title={`${boss.name} (${stateLabel})`}
      onClick={onClick}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={cancelLongPress}
      className="group absolute focus-visible:outline-none"
      style={{
        left: `${boss.mapX}%`,
        top: `${boss.mapY}%`,
        transform: `translate(-50%, -50%) scale(${1 / zoom})`,
        transformOrigin: 'center center',
        willChange: 'transform',
        zIndex: showPreview ? 10 : (state === 'none' ? 1 : 2),
      }}
    >
      {/* Marker icon */}
      <div className="transition-transform duration-100 group-hover:scale-110 group-focus-visible:scale-110">
        {state === 'none'     && <MarkerUntouched />}
        {state === 'deaths'   && <MarkerUndefeated deathCount={deathCount} />}
        {state === 'defeated' && <MarkerDefeated />}
      </div>

      {/* Hover / long-press preview card */}
      {showPreview && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-20 w-[200px]
                     bg-canvas-soft border border-hairline-dark rounded-md overflow-hidden flex items-stretch
                     shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          role="tooltip"
          aria-hidden="true"
        >
          {/* Boss thumbnail */}
          <div className="shrink-0 w-[60px] h-[60px] overflow-hidden">
            <img
              src={boss.imageUrl}
              alt=""
              draggable={false}
              className="w-full h-full object-cover"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />
          </div>

          {/* Info column */}
          <div className="flex flex-col justify-center gap-0.5 px-2.5 py-2 min-w-0">
            <span className="font-display text-[12px] font-semibold text-parchment-text leading-tight truncate">
              {boss.name}
            </span>
            <span className="font-zh text-[10px] text-primary opacity-70 leading-tight">
              {boss.nameZh}
            </span>
            <span className="font-sans text-[9px] tracking-[0.8px] uppercase text-parchment-text-mute mt-0.5">
              {TYPE_LABELS[boss.type] ?? boss.type}
            </span>
            <span
              className={[
                'font-mono text-[11px] font-bold mt-1',
                state === 'defeated'
                  ? 'text-jade'
                  : state === 'deaths'
                  ? 'text-primary'
                  : 'text-parchment-text-mute opacity-60',
              ].join(' ')}
            >
              {state === 'defeated'
                ? '勝 Vanquished'
                : state === 'deaths'
                ? `${deathCount} death${deathCount !== 1 ? 's' : ''}`
                : 'Not yet faced'}
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
