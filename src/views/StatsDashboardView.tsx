import { useRef } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { bosses } from '../data/bosses';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { RageMeter } from '../components/RageMeter';
import { BossFightTimeline } from '../components/BossFightTimeline';
import { AchievementPill } from '../components/AchievementPill';
import { ShareCTA } from '../components/ShareCTA';
import { StatsCardForExport } from '../components/StatsCardForExport';
import { exportStatsPng } from '../lib/statsImage';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  totalDeaths,
  totalKills,
  hardestBoss,
  cleanestKill,
  chapterProgress,
  avgDeathsPerBoss,
  highestRageEver,
  longestCleanStreak,
  hardestStreak,
} from '../lib/stats';

const CHAPTER_NAMES: Record<number, string> = {
  1: 'Black Wind Mountain',
  2: 'Yellow Wind Ridge',
  3: 'The New West',
  4: 'The Webbed Hollow',
  5: 'Flaming Mountains',
  6: 'Mount Huaguo',
};

export function StatsDashboardView() {
  const progress             = useTrackerStore((s) => s.progress);
  const unlockedAchievements = useTrackerStore((s) => s.unlockedAchievements);
  const exportRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!exportRef.current) return;
    await exportStatsPng(exportRef.current);
  }

  const deaths = totalDeaths(progress);
  const kills = totalKills(progress);
  const avg = avgDeathsPerBoss(progress, bosses);
  const hardest = hardestBoss(progress, bosses);
  const cleanest = cleanestKill(progress, bosses);
  const chapters = chapterProgress(progress, bosses);
  const rageResult = highestRageEver(progress, bosses);
  const cleanStreak = longestCleanStreak(progress, bosses);
  const deathStreak = hardestStreak(progress, bosses);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-10 space-y-10">

      {/* ── Top stats grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Deaths" value={deaths} sub="across all bosses" />
        <StatsCard title="Bosses Vanquished" value={kills} sub={`of ${bosses.length} total`} />
        <StatsCard
          title="Avg Deaths / Boss"
          value={avg}
          sub="on attempted bosses only"
        />

        {hardest && (
          <StatsCard
            title="Hardest Boss"
            value={hardest.deaths}
            sub={`${hardest.boss.name} — ${hardest.deaths} death${hardest.deaths !== 1 ? 's' : ''}`}
          />
        )}

        {cleanest && (
          <StatsCard
            title="Cleanest Kill"
            value={cleanest.deaths}
            sub={`${cleanest.boss.name} — ${cleanest.deaths === 0 ? 'first try' : `${cleanest.deaths} death${cleanest.deaths !== 1 ? 's' : ''}`}`}
          />
        )}

        {deathStreak && (
          <StatsCard
            title="Death Streak"
            value={deathStreak.streak}
            sub={`consecutive deaths — ${deathStreak.boss.name}`}
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

      {/* ── Rage meter ─────────────────────────────────────────── */}
      {rageResult && (
        <RageMeter rage={rageResult.rage} bossName={rageResult.boss.name} />
      )}

      {/* ── Chapter progress ───────────────────────────────────── */}
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

      {/* ── Achievements ──────────────────────────────────────── */}
      <div className="bg-surface-dark-card border border-hairline-dark rounded-lg p-6">
        <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text mb-5">
          Achievements
          {unlockedAchievements.length > 0 && (
            <span className="ml-3 font-mono text-counter-sm text-gold">
              {unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => (
            <AchievementPill
              key={a.id}
              name={a.name}
              description={a.description}
              unlocked={unlockedAchievements.includes(a.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Boss fight timeline ────────────────────────────────── */}
      <BossFightTimeline progress={progress} bosses={bosses} />

      {/* ── Share CTA ─────────────────────────────────────────── */}
      <ShareCTA onDownload={handleDownload} />

      {/* Hidden export card — mounted in DOM so html-to-image can rasterize it */}
      <StatsCardForExport ref={exportRef} progress={progress} />
    </div>
  );
}
