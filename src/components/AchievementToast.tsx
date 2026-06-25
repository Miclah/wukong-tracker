import { useEffect } from 'react';
import type { Achievement } from '../data/achievements';
import { SealStamp } from './SealStamp';

interface Props {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-parchment border border-gold/60 rounded-md px-4 py-3 shadow-lg animate-achievement-in"
      style={{ minWidth: 280, maxWidth: 360 }}
    >
      {/* Seal stamp animates in with scale punch */}
      <div className="flex-shrink-0 animate-stamp-in">
        <SealStamp size={44} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="font-sans text-[10px] font-semibold tracking-[1.2px] uppercase text-gold">
          Achievement Unlocked
        </p>
        <p className="font-display text-title-sm font-medium text-ink leading-tight">
          {achievement.name}
        </p>
        <p className="font-sans text-body-sm text-ink-mute leading-snug">
          {achievement.description}
        </p>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 ml-auto text-ink-faded hover:text-ink-mute transition-colors font-sans text-sm"
      >
        ✕
      </button>
    </div>
  );
}
