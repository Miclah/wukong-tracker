import { SealStamp } from './SealStamp';

interface Props {
  name: string;
  description: string;
  unlocked: boolean;
}

export function AchievementPill({ name, description, unlocked }: Props) {
  return (
    <div
      className={[
        'flex items-center gap-3 rounded-md px-3 py-2.5 border transition-colors',
        unlocked
          ? 'bg-parchment border-gold/70'
          : 'bg-parchment/30 border-hairline',
      ].join(' ')}
      aria-label={unlocked ? `Achievement: ${name}` : `Locked achievement: ${name}`}
    >
      {/* Stamp — visible when unlocked, dimmed silhouette when locked */}
      <div className={unlocked ? 'flex-shrink-0' : 'flex-shrink-0 opacity-20 grayscale'}>
        <SealStamp size={36} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <p
          className={[
            'font-display text-title-sm font-medium leading-tight truncate',
            unlocked ? 'text-ink' : 'text-ink-faded',
          ].join(' ')}
        >
          {name}
        </p>
        <p
          className={[
            'font-sans text-[12px] leading-snug',
            unlocked ? 'text-ink-mute' : 'text-ink-faded/60',
          ].join(' ')}
        >
          {description}
        </p>
      </div>

      {unlocked && (
        <span className="flex-shrink-0 ml-auto text-gold text-[18px]" aria-hidden="true">
          ✦
        </span>
      )}
    </div>
  );
}
