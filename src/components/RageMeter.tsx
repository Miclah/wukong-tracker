import { useEffect, useRef, useState } from 'react';

type Props = {
  rage: number;
  bossName?: string;
};

type Level = 0 | 1 | 2 | 3 | 4;

const THRESHOLDS: [number, Level][] = [
  [10, 4],
  [7, 3],
  [4, 2],
  [2, 1],
  [0, 0],
];

const ZH_NAMES  = ['平靜', '煩', '怒', '狂', '大聖怒'] as const;
const EN_NAMES  = ['Calm', 'Vexed', 'Rage', 'Wild', "Great Sage's Fury"] as const;
// Fraction of flame height revealed per level (0 → 1/5 → 2/5 → 4/5 → full)
const CLIP_FRAC = [0, 0.2, 0.4, 0.8, 1.0] as const;

const SVG_H = 200;
// Flame silhouette path in viewBox 0 0 100 200
const FLAME_PATH =
  'M 50,198 C 12,182 2,150 8,118 C 14,90 30,100 34,76 ' +
  'C 38,56 34,28 42,6 C 48,28 46,58 54,74 ' +
  'C 60,90 76,84 78,112 C 84,146 74,184 50,198 Z';
// Inner hot-core
const CORE_PATH =
  'M 50,148 C 35,128 30,105 38,84 C 44,70 50,52 50,36 ' +
  'C 50,52 56,70 62,84 C 70,105 65,128 50,148 Z';

function getLevel(rage: number): Level {
  for (const [t, l] of THRESHOLDS) {
    if (rage >= t) return l;
  }
  return 0;
}

export function RageMeter({ rage, bossName }: Props) {
  const level  = getLevel(rage);
  const clipH  = Math.round(SVG_H * CLIP_FRAC[level]);
  const isMaxed = level === 4;

  const containerRef = useRef<HTMLDivElement>(null);
  const [shaken, setShaken] = useState(false);

  useEffect(() => {
    if (isMaxed && !shaken && containerRef.current) {
      containerRef.current.classList.add('rage-shake');
      const t = setTimeout(() => {
        containerRef.current?.classList.remove('rage-shake');
        setShaken(true);
      }, 620);
      return () => clearTimeout(t);
    }
  }, [isMaxed, shaken]);

  return (
    <div
      ref={containerRef}
      className="bg-surface-dark-card border border-hairline-dark rounded-lg p-6"
    >
      <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text mb-6">
        Rage Meter
      </h3>

      <div className="flex items-end gap-8">

        {/* ── Flame SVG ──────────────────────────────────────────── */}
        <div className="relative flex-shrink-0">
          <svg
            width="72"
            height="144"
            viewBox="0 0 100 200"
            aria-hidden="true"
            className={level > 0 ? 'rage-flicker' : undefined}
          >
            <defs>
              <linearGradient id="rageFlameGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stopColor="#1f1812" />
                <stop offset="35%"  stopColor="#9e3329" />
                <stop offset="70%"  stopColor="#c4453a" />
                <stop offset="100%" stopColor="#c89b3c" />
              </linearGradient>
              {/* Clip rect rises from bottom as level increases */}
              <clipPath id="rageFlameClip">
                <rect x="-5" y={SVG_H - clipH} width="110" height={clipH + 5} />
              </clipPath>
            </defs>

            {/* Ghost outline (always visible, very faint) */}
            <path d={FLAME_PATH} fill="currentColor" opacity="0.07"
              className="text-parchment-text" />

            {/* Filled flame — clipped to current level */}
            {level > 0 && (
              <path
                d={FLAME_PATH}
                fill="url(#rageFlameGrad)"
                clipPath="url(#rageFlameClip)"
              />
            )}

            {/* Inner hot-core at level 2+ */}
            {level >= 2 && (
              <path
                d={CORE_PATH}
                fill="#e8a04c"
                opacity={level >= 3 ? 0.65 : 0.38}
                clipPath="url(#rageFlameClip)"
              />
            )}
          </svg>

          {/* Ember glow at max */}
          {isMaxed && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 85%, rgba(196,69,58,0.45) 0%, transparent 68%)',
                filter: 'blur(10px)',
              }}
            />
          )}
        </div>

        {/* ── Labels ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono leading-none text-primary"
              style={{ fontSize: '3.25rem', fontWeight: 700 }}>
              {rage}
            </span>
            <span className="font-zh text-[1.6rem] font-bold text-parchment-text-mute">
              {ZH_NAMES[level]}
            </span>
          </div>

          <p className="font-sans text-[11px] uppercase tracking-widest text-ink-faded">
            consecutive deaths · 10 min window
          </p>

          {bossName && (
            <p className="font-sans text-[13px] text-parchment-text-mute mt-1">
              vs {bossName}
            </p>
          )}

          <p className="font-display-alt italic text-[12px] text-parchment-text-mute mt-2 opacity-60">
            {EN_NAMES[level]}
          </p>
        </div>
      </div>

      {isMaxed && (
        <p className="mt-5 font-display text-[13px] text-primary tracking-wide animate-pulse">
          大聖怒 — Great Sage's Fury
        </p>
      )}
    </div>
  );
}
