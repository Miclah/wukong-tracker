import { useState } from 'react';
import type { Boss, BossProgress, Attempt } from '../types';

type FeedEntry = Attempt & { boss: Boss };

type Props = {
  progress: Record<string, BossProgress>;
  bosses: Boss[];
};

const CHAPTERS = [0, 1, 2, 3, 4, 5, 6] as const;
type ChapterFilter = (typeof CHAPTERS)[number];

const CHAPTER_LABELS: Record<number, string> = {
  0: 'All',
  1: '第一回',
  2: '第二回',
  3: '第三回',
  4: '第四回',
  5: '第五回',
  6: '第六回',
};

function dateLabel(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = todayStart - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round(diff / 86_400_000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function groupByDate(entries: FeedEntry[]): { label: string; key: string; entries: FeedEntry[] }[] {
  const groups: Map<string, FeedEntry[]> = new Map();
  for (const e of entries) {
    const label = dateLabel(e.timestamp);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(e);
  }
  return Array.from(groups.entries()).map(([label, entries]) => ({
    label,
    key: label,
    entries,
  }));
}

function DeathDot() {
  return (
    <div
      aria-hidden="true"
      className="absolute w-3 h-3 rounded-full bg-primary border-2 border-primary"
      style={{ left: 44, top: 14 }}
    />
  );
}

function KillDot() {
  return (
    <div
      aria-hidden="true"
      className="absolute w-3 h-3 rounded-full bg-jade border-2 border-jade"
      style={{ left: 44, top: 14 }}
    />
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

  const groups = groupByDate(feed);

  return (
    <div className="bg-surface-dark-card border border-hairline-dark rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-hairline-dark">
        <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text mb-4">
          Battle Chronicle
        </h3>

        {/* Chapter filter chips */}
        <div className="flex gap-1 flex-wrap">
          {CHAPTERS.map((ch) => (
            <button
              key={ch}
              onClick={() => setChapter(ch)}
              className={[
                'px-3 py-1.5 rounded-md font-zh text-[11px] font-semibold tracking-[0.8px] transition-colors',
                chapter === ch
                  ? 'bg-parchment-aged text-ink'
                  : 'text-parchment-text-mute border border-hairline-dark hover:text-parchment-text',
              ].join(' ')}
              aria-pressed={chapter === ch}
            >
              {CHAPTER_LABELS[ch]}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline body */}
      {feed.length === 0 ? (
        <p className="px-6 py-10 font-display-alt italic text-[14px] text-parchment-text-mute">
          No tale yet told. The mountain awaits your first defeat.
        </p>
      ) : (
        <div className="px-6 pb-8 max-h-[620px] overflow-y-auto" aria-label="Boss fight chronicle">
          {groups.map((group, gi) => (
            <div key={group.key}>
              {/* Date header — sits above the rail, full width */}
              <div className={`${gi === 0 ? 'pt-6' : 'pt-2'} pb-3 flex items-center gap-3`}>
                <span className="font-sans text-[11px] uppercase tracking-[1.8px] text-parchment-text-mute select-none">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-hairline-dark" />
              </div>

              {/* Entries with rail */}
              <div className="relative">
                {/* Vermillion rail — 2px, runs the full height of this group's entries */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 w-[2px] bg-primary opacity-50"
                  style={{ left: 50 }}
                />

                <ol className="space-y-0">
                  {group.entries.map((entry) => {
                    const isDeath = entry.type === 'death';
                    return (
                      <li
                        key={entry.id}
                        className="relative pl-[72px] py-3"
                      >
                        {/* Dot on the rail */}
                        {isDeath ? <DeathDot /> : <KillDot />}

                        <div className="min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={`font-display text-[13px] font-medium tracking-[0.3px] ${
                                isDeath ? 'text-primary' : 'text-jade'
                              }`}
                            >
                              {isDeath ? 'DEATH' : 'VANQUISHED'}
                              {' · '}
                              <span className="text-parchment-text">{entry.boss.name}</span>
                            </span>
                            <span className="font-mono text-[11px] text-parchment-text-mute flex-shrink-0">
                              {relativeTime(entry.timestamp)}
                            </span>
                          </div>

                          {entry.note && (
                            <p className="font-display-alt italic text-[13px] text-parchment-text-mute mt-1 leading-snug">
                              {entry.note}
                            </p>
                          )}

                          {entry.gif && (
                            <img
                              src={entry.gif.thumbnailUrl}
                              alt={entry.gif.description}
                              className="mt-2 rounded max-h-16 object-cover"
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
