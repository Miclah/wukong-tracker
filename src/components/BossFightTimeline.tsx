import { useState } from 'react';
import type { Boss, BossProgress, Attempt } from '../types';

type FeedEntry = Attempt & { boss: Boss };

type Props = {
  progress: Record<string, BossProgress>;
  bosses: Boss[];
};

const CHAPTERS = [0, 1, 2, 3, 4, 5, 6] as const;
type ChapterFilter = (typeof CHAPTERS)[number]; // 0 = All

const CHAPTER_LABELS: Record<number, string> = {
  0: 'All',
  1: '第一回',
  2: '第二回',
  3: '第三回',
  4: '第四回',
  5: '第五回',
  6: '第六回',
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function DeathIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="7" fill="#c4453a" opacity="0.15" />
      <circle cx="8" cy="7" r="3.5" fill="#c4453a" opacity="0.7" />
      <rect x="5.5" y="9.5" width="2" height="2" rx="0.5" fill="#c4453a" opacity="0.5" />
      <rect x="8.5" y="9.5" width="2" height="2" rx="0.5" fill="#c4453a" opacity="0.5" />
    </svg>
  );
}

function KillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="7" fill="#5a8a6e" opacity="0.15" />
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

export function BossFightTimeline({ progress, bosses }: Props) {
  const [chapter, setChapter] = useState<ChapterFilter>(0);

  const filteredBosses = chapter === 0 ? bosses : bosses.filter((b) => b.chapter === chapter);

  const feed: FeedEntry[] = filteredBosses.flatMap((boss) => {
    const bp = progress[boss.id];
    if (!bp) return [];
    return bp.attempts.map((a) => ({ ...a, boss }));
  });

  feed.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-surface-dark-card border border-hairline-dark rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-hairline-dark">
        <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text mb-4">
          Battle Chronicle
        </h3>

        {/* Chapter filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {CHAPTERS.map((ch) => (
            <button
              key={ch}
              onClick={() => setChapter(ch)}
              className={[
                'px-3 py-1.5 rounded-md font-sans text-[11px] font-semibold tracking-[1.2px] uppercase transition-colors',
                chapter === ch
                  ? 'bg-parchment-aged text-ink'
                  : 'text-parchment-text-mute border border-hairline-dark hover:text-parchment-text',
              ].join(' ')}
            >
              {CHAPTER_LABELS[ch]}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {feed.length === 0 ? (
        <p className="px-6 py-8 font-sans text-[13px] text-parchment-text-mute italic">
          No attempts logged yet. Start fighting.
        </p>
      ) : (
        <ol className="divide-y divide-hairline-dark max-h-[520px] overflow-y-auto" aria-label="Boss fight chronicle">
          {feed.map((entry, i) => {
            const isDeath = entry.type === 'death';
            return (
              <li key={`${entry.id}-${i}`} className="flex gap-3 px-6 py-3">
                {isDeath ? <DeathIcon /> : <KillIcon />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={`font-display text-[13px] font-medium tracking-[0.3px] ${
                        isDeath ? 'text-primary' : 'text-jade'
                      }`}
                    >
                      {isDeath ? 'Died to' : 'Vanquished'}{' '}
                      <span className="text-parchment-text">{entry.boss.name}</span>
                    </span>
                    <span className="font-sans text-[12px] text-parchment-text-mute flex-shrink-0">
                      {relativeTime(entry.timestamp)}
                    </span>
                  </div>

                  {entry.note && (
                    <p className="font-sans text-[13px] text-parchment-text-mute mt-0.5 leading-snug">
                      {entry.note}
                    </p>
                  )}

                  {entry.gif && (
                    <img
                      src={entry.gif.thumbnailUrl}
                      alt={entry.gif.description}
                      className="mt-1.5 rounded-sm max-h-16 object-cover"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
