import { useState, Fragment } from 'react';
import type { Boss, BossProgress, Attempt } from '../types';
import { useHashRoute } from '../hooks/useHashRoute';

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
  const { navigate } = useHashRoute();

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

        {/* Chapter filter — ink-stroke tabs */}
        <div className="flex items-center flex-wrap gap-y-1" role="tablist" aria-label="Filter by chapter">
          {CHAPTERS.map((ch, i) => {
            const isActive = chapter === ch;
            return (
              <Fragment key={ch}>
                {i > 0 && (
                  <span aria-hidden="true" className="mx-2 text-hairline select-none text-[12px]">·</span>
                )}
                <button
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setChapter(ch)}
                  className="relative flex flex-col items-center pb-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                >
                  <span
                    className={`font-zh text-[13px] tracking-[0.5px] transition-colors duration-150 ${
                      isActive
                        ? 'text-parchment-text'
                        : 'text-parchment-text-mute hover:text-parchment-text'
                    }`}
                  >
                    {CHAPTER_LABELS[ch]}
                  </span>
                  {/* Brush-stroke SVG underline — only rendered when active */}
                  <span className="absolute bottom-0 left-0 right-0" style={{ height: 6 }} aria-hidden="true">
                    {isActive && (
                      <svg
                        width="100%"
                        height="6"
                        viewBox="0 0 60 6"
                        preserveAspectRatio="none"
                        className="brush-stroke-in"
                      >
                        <path
                          d="M0,4.5 C8,1.5 20,5.5 30,3 C40,0.5 52,5 60,3.5"
                          stroke="#c4453a"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              </Fragment>
            );
          })}
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

                        {/* Large entry card */}
                        <div className="bg-canvas-warm border border-hairline-dark rounded-lg p-4 min-w-0">
                          {/* Card top row: thumbnail + meta | GIF */}
                          <div className="flex gap-4">
                            {/* Left: thumbnail + info */}
                            <div className="flex gap-3 flex-1 min-w-0">
                              {/* Boss thumbnail 60×60 */}
                              <img
                                src={entry.boss.imageUrl}
                                alt={entry.boss.name}
                                className="w-[60px] h-[60px] rounded-lg object-cover flex-shrink-0 border border-hairline-dark"
                                style={{
                                  objectPosition: entry.boss.focalPoint
                                    ? `${entry.boss.focalPoint.x * 100}% ${entry.boss.focalPoint.y * 100}%`
                                    : 'center',
                                }}
                              />
                              {/* Name + type + time */}
                              <div className="min-w-0 flex flex-col justify-center gap-0.5">
                                <button
                                  onClick={() => navigate(`/boss/${entry.boss.id}`)}
                                  className={`font-display text-[14px] font-semibold tracking-[0.3px] text-left hover:underline ${
                                    isDeath ? 'text-primary' : 'text-jade'
                                  }`}
                                >
                                  {entry.boss.name}
                                </button>
                                <span className="font-zh text-[11px] text-parchment-text-mute">
                                  {entry.boss.nameZh}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`font-sans text-[10px] font-bold uppercase tracking-[1.4px] px-1.5 py-0.5 rounded ${
                                      isDeath
                                        ? 'bg-primary/15 text-primary'
                                        : 'bg-jade/15 text-jade'
                                    }`}
                                  >
                                    {isDeath ? 'Death' : 'Vanquished'}
                                  </span>
                                  <span className="font-mono text-[11px] text-parchment-text-mute">
                                    {relativeTime(entry.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: GIF */}
                            {entry.gif && (
                              <div className="flex-shrink-0">
                                <img
                                  src={entry.gif.url}
                                  alt={entry.gif.description}
                                  className="rounded-md object-cover"
                                  style={{ minWidth: 280, minHeight: 160, maxWidth: 320, maxHeight: 200 }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Note below, full width */}
                          {entry.note && (
                            <p className="font-display-alt italic text-[13px] text-parchment-text-mute mt-3 leading-relaxed border-t border-hairline-dark pt-3">
                              {entry.note}
                            </p>
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
