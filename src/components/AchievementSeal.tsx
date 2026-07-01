import { useState } from 'react';
import type { Achievement } from '../data/achievements';

interface Props {
  achievement: Achievement;
  unlocked: boolean;
}

function SealShape({ unlocked }: { unlocked: boolean }) {
  if (unlocked) {
    return (
      <>
        <rect x="2" y="2" width="76" height="76" rx="1.5" fill="#c4453a" />
        <rect x="7" y="7" width="66" height="66" rx="0.5" fill="none"
          stroke="#f5e9d4" strokeWidth="1" opacity="0.45" />
        <rect x="2" y="2" width="76" height="76" rx="1.5"
          fill="none" stroke="#6b1f1a" strokeWidth="2" opacity="0.4" />
      </>
    );
  }
  return (
    <>
      {/* Ghost outline — more visible */}
      <rect x="2" y="2" width="76" height="76" rx="1.5" fill="none"
        stroke="#c4453a" strokeWidth="2.5" opacity="0.35" />
      <rect x="7" y="7" width="66" height="66" rx="0.5" fill="none"
        stroke="#c4453a" strokeWidth="1" opacity="0.18" />
    </>
  );
}

export function AchievementSeal({ achievement, unlocked }: Props) {
  const [hinted, setHinted] = useState(false);
  const chars = achievement.nameZh.split('');

  return (
    <div
      className="flex flex-col items-center gap-2 text-center select-none"
      onMouseEnter={() => setHinted(true)}
      onMouseLeave={() => setHinted(false)}
      onFocus={() => setHinted(true)}
      onBlur={() => setHinted(false)}
      tabIndex={0}
      role="article"
      aria-label={
        unlocked
          ? `Achievement unlocked: ${achievement.name}`
          : `Locked achievement: ${achievement.name}`
      }
    >
      {/* Seal stamp */}
      <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden="true"
          className="-rotate-[2deg]"
        >
          <SealShape unlocked={unlocked} />
        </svg>

        {/* Characters overlay */}
        <div className="absolute inset-0 flex items-center justify-center -rotate-[2deg]">
          {unlocked ? (
            <div className="flex flex-col items-center leading-none gap-0.5">
              {chars.map((ch, i) => (
                <span
                  key={i}
                  className="font-zh font-bold text-on-vermilion"
                  style={{ fontSize: chars.length > 2 ? '22px' : '26px', lineHeight: 1 }}
                >
                  {ch}
                </span>
              ))}
            </div>
          ) : (
            /* 封 — visible but clearly "sealed" */
            <span
              className="font-zh font-bold"
              style={{ fontSize: '36px', color: '#c4453a', opacity: 0.35, lineHeight: 1 }}
            >
              封
            </span>
          )}
        </div>
      </div>

      {/* English name */}
      <p
        className={[
          'font-display text-[13px] leading-tight',
          unlocked ? 'text-parchment-text' : 'text-ink-faded',
        ].join(' ')}
      >
        {achievement.name}
      </p>

      {/* Description when unlocked; poetic hint when locked + hovered */}
      <div className="min-h-[40px] w-full">
        {unlocked ? (
          <p
            className="font-sans text-[12px] text-parchment-text-mute leading-snug"
            style={{ maxWidth: 100, margin: '0 auto' }}
          >
            {achievement.description}
          </p>
        ) : (
          <p
            className="font-display-alt italic text-[12px] text-parchment-text-mute leading-snug transition-opacity duration-200"
            style={{
              maxWidth: 100,
              margin: '0 auto',
              opacity: hinted ? 1 : 0,
            }}
            aria-hidden={!hinted}
          >
            {achievement.lockedHint}
          </p>
        )}
      </div>
    </div>
  );
}

function TallyStroke({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="22" viewBox="0 0 20 24" aria-hidden="true">
      <path
        d="M5 20 Q7 15 10 10 Q13 6 16 5 Q15 9 12 13 Q9 17 6 21 Q5 21.5 5 20Z"
        fill={filled ? '#c4453a' : 'currentColor'}
        opacity={filled ? 1 : 0.28}
        className={filled ? '' : 'text-ink-faded'}
      />
    </svg>
  );
}

// Progress strip — inline SVG tally marks, vermillion when unlocked
export function AchievementProgressStrip({
  total,
  unlocked,
}: {
  total: number;
  unlocked: number;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: total }, (_, i) => (
        <TallyStroke key={i} filled={i < unlocked} />
      ))}
      <span className="font-mono text-[17px] font-semibold text-parchment-text ml-3">
        {unlocked} / {total}
      </span>
    </div>
  );
}
