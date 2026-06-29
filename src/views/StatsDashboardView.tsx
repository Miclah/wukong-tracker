import { useRef, useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { useSharedStore } from '../store/useSharedStore';
import { useViewProgress, useViewAchievements } from '../hooks/useViewState';
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
import { exportJson, parseBackup } from '../lib/backup';
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
  const progress             = useViewProgress();
  const unlockedAchievements = useViewAchievements();
  const isReadOnly           = useSharedStore((s) => s.isReadOnly);
  const restoreFromBackup    = useTrackerStore((s) => s.restoreFromBackup);
  const exportRef  = useRef<HTMLDivElement>(null);
  const importRef  = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleDownload() {
    if (!exportRef.current) return;
    await exportStatsPng(exportRef.current);
  }

  function handleExportJson() {
    exportJson(progress, unlockedAchievements);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = parseBackup(ev.target?.result as string);
        if (!window.confirm('This will replace all your current data. Continue?')) return;
        restoreFromBackup(data.progress, data.unlockedAchievements);
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Invalid backup file');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported if needed
    e.target.value = '';
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
    <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-10">

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

      {/* ── Share CTA — hidden in read-only mode ─────────────── */}
      {!isReadOnly && <ShareCTA onDownload={handleDownload} />}

      {/* ── Backup / Restore — hidden in read-only mode ───────── */}
      {!isReadOnly && (
        <div className="bg-surface-dark-card border border-hairline-dark rounded-lg p-6">
          <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text mb-2">
            Backup & Restore
          </h3>
          <p className="font-sans text-body-sm text-parchment-text-mute mb-5">
            Export your full journal (including attempt logs and GIFs) as JSON, or restore from a previous backup.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportJson}
              className="px-5 h-10 rounded-md bg-parchment text-ink font-sans text-btn tracking-[0.3px] hover:bg-parchment-aged transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => { setImportError(null); importRef.current?.click(); }}
              className="px-5 h-10 rounded-md border border-hairline font-sans text-btn text-parchment-text-mute hover:bg-canvas-soft transition-colors"
            >
              Import JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              aria-hidden="true"
              onChange={handleImportFile}
            />
          </div>
          {importError && (
            <p className="mt-3 font-sans text-body-sm text-primary" role="alert">
              {importError}
            </p>
          )}
        </div>
      )}

      {/* Hidden export card — mounted in DOM so html-to-image can rasterize it */}
      <StatsCardForExport ref={exportRef} progress={progress} />
    </div>
  );
}
