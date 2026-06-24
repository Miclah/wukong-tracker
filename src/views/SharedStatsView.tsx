import { useSharedStore } from '../store/useSharedStore';
import { bosses } from '../data/bosses';
import type { BossSnapshot, SharedSummary } from '../lib/share';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { RageMeter } from '../components/RageMeter';

const CHAPTER_NAMES: Record<number, string> = {
  1: 'Black Wind Mountain',
  2: 'Yellow Wind Ridge',
  3: 'The New West',
  4: 'The Webbed Hollow',
  5: 'Flaming Mountains',
  6: 'Mount Huaguo',
};

// ── Stat helpers (operate directly on BossSnapshot — no attempt arrays) ──────

function sumDeaths(snapshots: Record<string, BossSnapshot>): number {
  return Object.values(snapshots).reduce((acc, s) => acc + s.d, 0);
}

function countKills(snapshots: Record<string, BossSnapshot>): number {
  return Object.values(snapshots).filter((s) => s.k).length;
}

function avgDeaths(snapshots: Record<string, BossSnapshot>): number {
  const entries = Object.values(snapshots).filter((s) => s.d > 0 || s.k);
  if (entries.length === 0) return 0;
  const total = entries.reduce((acc, s) => acc + s.d, 0);
  return Math.round((total / entries.length) * 10) / 10;
}

function hardestBoss(
  snapshots: Record<string, BossSnapshot>,
): { name: string; deaths: number } | null {
  let best: { name: string; deaths: number } | null = null;
  for (const [bossId, snap] of Object.entries(snapshots)) {
    if (snap.d === 0) continue;
    const boss = bosses.find((b) => b.id === bossId);
    if (!boss) continue;
    if (!best || snap.d > best.deaths) best = { name: boss.name, deaths: snap.d };
  }
  return best;
}

function cleanestKill(
  snapshots: Record<string, BossSnapshot>,
): { name: string; deaths: number } | null {
  let best: { name: string; deaths: number } | null = null;
  for (const [bossId, snap] of Object.entries(snapshots)) {
    if (!snap.k) continue;
    const boss = bosses.find((b) => b.id === bossId);
    if (!boss) continue;
    if (!best || snap.d < best.deaths) best = { name: boss.name, deaths: snap.d };
  }
  return best;
}

function worstDeathStreak(
  snapshots: Record<string, BossSnapshot>,
): { name: string; streak: number } | null {
  let best: { name: string; streak: number } | null = null;
  for (const [bossId, snap] of Object.entries(snapshots)) {
    if (snap.ds === 0) continue;
    const boss = bosses.find((b) => b.id === bossId);
    if (!boss) continue;
    if (!best || snap.ds > best.streak) best = { name: boss.name, streak: snap.ds };
  }
  return best;
}

function highestRage(
  snapshots: Record<string, BossSnapshot>,
): { name: string; rage: number } | null {
  let best: { name: string; rage: number } | null = null;
  for (const [bossId, snap] of Object.entries(snapshots)) {
    if (snap.pr === 0) continue;
    const boss = bosses.find((b) => b.id === bossId);
    if (!boss) continue;
    if (!best || snap.pr > best.rage) best = { name: boss.name, rage: snap.pr };
  }
  return best;
}

type ChapterRow = { chapter: number; defeated: number; total: number };

function chapterProgress(snapshots: Record<string, BossSnapshot>): ChapterRow[] {
  const rows: ChapterRow[] = [];
  for (let ch = 1; ch <= 6; ch++) {
    const chBosses = bosses.filter((b) => b.chapter === ch);
    const defeated = chBosses.filter((b) => snapshots[b.id]?.k).length;
    rows.push({ chapter: ch, defeated, total: chBosses.length });
  }
  return rows;
}

// ── Component ──────────────────────────────────────────────────────────────────

function SharedStatsContent({ summary }: { summary: SharedSummary }) {
  const { bosses: snapshots, cleanStreak } = summary;

  const deaths = sumDeaths(snapshots);
  const kills = countKills(snapshots);
  const avg = avgDeaths(snapshots);
  const hardest = hardestBoss(snapshots);
  const cleanest = cleanestKill(snapshots);
  const deathStreak = worstDeathStreak(snapshots);
  const rageResult = highestRage(snapshots);
  const chapters = chapterProgress(snapshots);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-10 space-y-10">

      {/* ── Read-only banner ──────────────────────────────────── */}
      <div className="bg-surface-dark-card border border-hairline-dark rounded-lg px-6 py-4 flex items-center gap-3">
        <span className="font-sans text-[11px] font-semibold tracking-[1.2px] uppercase text-parchment-text-mute">
          Shared view
        </span>
        <span className="w-px h-4 bg-hairline-dark" />
        <p className="font-sans text-[14px] text-parchment-text">
          Viewing someone&apos;s suffering — read-only. Their data lives in their browser.
        </p>
      </div>

      {/* ── Top stats grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Deaths" value={deaths} sub="across all bosses" />
        <StatsCard title="Bosses Vanquished" value={kills} sub={`of ${bosses.length} total`} />
        <StatsCard title="Avg Deaths / Boss" value={avg} sub="on attempted bosses only" />

        {hardest && (
          <StatsCard
            title="Hardest Boss"
            value={hardest.deaths}
            sub={`${hardest.name} — ${hardest.deaths} death${hardest.deaths !== 1 ? 's' : ''}`}
          />
        )}

        {cleanest && (
          <StatsCard
            title="Cleanest Kill"
            value={cleanest.deaths}
            sub={`${cleanest.name} — ${cleanest.deaths === 0 ? 'first try' : `${cleanest.deaths} death${cleanest.deaths !== 1 ? 's' : ''}`}`}
          />
        )}

        {deathStreak && (
          <StatsCard
            title="Death Streak"
            value={deathStreak.streak}
            sub={`consecutive deaths — ${deathStreak.name}`}
          />
        )}

        {cleanStreak > 0 && (
          <StatsCard
            title="Clean Streak"
            value={cleanStreak}
            sub="bosses defeated with 0 deaths in a row"
          />
        )}
      </div>

      {/* ── Rage meter ────────────────────────────────────────── */}
      {rageResult && (
        <RageMeter rage={rageResult.rage} bossName={rageResult.name} />
      )}

      {/* ── Chapter progress ──────────────────────────────────── */}
      <div className="bg-surface-dark-card border border-hairline-dark rounded-lg p-6 space-y-5">
        <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text">
          Chapter Progress
        </h3>
        {chapters.map(({ chapter, defeated, total }) => (
          <div key={chapter} className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-[13px] font-semibold text-parchment-text">
                Ch. {chapter} — {CHAPTER_NAMES[chapter]}
              </span>
            </div>
            <ProgressBar
              value={total > 0 ? (defeated / total) * 100 : 0}
              label={`${defeated} / ${total} vanquished`}
            />
          </div>
        ))}
      </div>

      {/* ── Timeline omission note ────────────────────────────── */}
      <p className="font-sans text-[13px] text-parchment-text-mute text-center pb-4">
        The full attempt journal (GIFs, notes, timestamps) lives only on their device.
      </p>
    </div>
  );
}

export function SharedStatsView() {
  const summary = useSharedStore((s) => s.sharedSummary);

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-sans text-parchment-text-mute text-[15px]">
          No shared data found. The link may be invalid or expired.
        </p>
      </div>
    );
  }

  return <SharedStatsContent summary={summary} />;
}
