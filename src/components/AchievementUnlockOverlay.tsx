import { useEffect, useState } from 'react';
import type { Achievement } from '../data/achievements';
import { SealStamp } from './SealStamp';

interface Props {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementUnlockOverlay({ achievement, onDismiss }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Start fade-out at 1.7s so the full cycle is ~2s
    const fadeTimer = setTimeout(() => setLeaving(true), 1700);
    const dismissTimer = setTimeout(onDismiss, 2100);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [achievement, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Achievement unlocked: ${achievement.name}`}
      className={[
        'fixed inset-0 z-[200] flex flex-col items-center justify-center',
        'pointer-events-none select-none',
        leaving ? 'achievement-overlay-out' : 'achievement-overlay-in',
      ].join(' ')}
      onClick={onDismiss}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Parchment wash */}
      <div className="absolute inset-0 bg-parchment" style={{ opacity: 0.88 }} />

      {/* Content above the wash */}
      <div className="relative flex flex-col items-center gap-6 text-center px-8">

        {/* Seal — drops from above with bounce */}
        <div className="achievement-stamp-drop">
          <SealStamp size={120} />
        </div>

        {/* Label */}
        <div className="achievement-name-rise">
          <p className="font-sans text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-2">
            成就解鎖 · Achievement Unlocked
          </p>
          <p className="font-display text-[2.2rem] font-medium tracking-wide text-ink leading-tight">
            {achievement.name}
          </p>
          <p className="font-zh text-[1.4rem] text-primary mt-1 font-bold">
            {achievement.nameZh}
          </p>
          <p className="font-sans text-[14px] text-ink-mute mt-3 max-w-[320px] leading-relaxed">
            {achievement.description}
          </p>
        </div>

        <p className="font-display-alt italic text-[12px] text-ink-faded mt-2">
          Tap to dismiss
        </p>
      </div>
    </div>
  );
}
