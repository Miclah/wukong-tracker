import { useRef, useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { useSharedStore } from '../store/useSharedStore';
import { useViewProgress, useViewAchievements } from '../hooks/useViewState';
import { bosses } from '../data/bosses';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { RageMeter } from '../components/RageMeter';
import { BossFightTimeline } from '../components/BossFightTimeline';
import { AchievementSeal, AchievementProgressStrip } from '../components/AchievementSeal';
import type { AchievementCategory } from '../data/achievements';
import { ShareCTA } from '../components/ShareCTA';
import { ExportPickerModal } from '../components/ExportPickerModal';
import { ACHIEVEMENTS } from '../data/achievements';
import { exportJson, parseBackup } from '../lib/backup';
import {
  totalDeaths,
  totalKills,
  hardestBoss,
  cleanestKill,
  chapterProgress,
  avgDeathsPerBoss,
  currentRageStreak,
  longestCleanStreak,
  hardestStreak,
} from '../lib/stats';

const ACHIEVEMENT_CATEGORIES: { key: AchievementCategory; sub: string }[] = [
  { key: '受', sub: 'Suffering' },
  { key: '勝', sub: 'Victory' },
  { key: '賢', sub: 'Sagacity' },
];

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
  const importRef  = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showExportPicker, setShowExportPicker] = useState(false);

  function handleDownload() {
    setShowExportPicker(true);
    return Promise.resolve();
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
  const rageResult = currentRageStreak(progress, bosses);
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
      <div className="bg-surface-dark-card border border-hairline-dark rounded-lg p-6 space-y-8">
        <div>
          <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text mb-4">
            Achievements
          </h3>
          <AchievementProgressStrip
            total={ACHIEVEMENTS.length}
            unlocked={unlockedAchievements.length}
          />
        </div>

        {unlockedAchievements.length === 0 && (
          <div className="flex items-center gap-4 rounded-md border border-primary/30 bg-primary/5 px-5 py-4">
            <svg width="44" height="44" viewBox="0 0 80 80" fill="none" aria-hidden="true" className="-rotate-[2deg] flex-shrink-0">
              <rect x="2" y="2" width="76" height="76" rx="1.5" fill="#c4453a" />
              <rect x="7" y="7" width="66" height="66" rx="0.5" fill="none" stroke="#f5e9d4" strokeWidth="1" opacity="0.45" />
            </svg>
            <p className="font-display-alt italic text-parchment-text text-[15px]">
              Your legend begins with the first death.
            </p>
          </div>
        )}

        {ACHIEVEMENT_CATEGORIES.map(({ key, sub }) => {
          const group = ACHIEVEMENTS.filter((a) => a.category === key);
          return (
            <div key={key}>
              <div className="flex items-baseline gap-2 mb-5">
                <span className="font-zh text-[26px] font-bold text-primary">{key}</span>
                <span className="font-sans text-[11px] uppercase tracking-[1.5px] text-ink-faded">
                  {sub}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {group.map((a) => (
                  <AchievementSeal
                    key={a.id}
                    achievement={a}
                    unlocked={unlockedAchievements.includes(a.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
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

      {showExportPicker && (
        <ExportPickerModal
          progress={progress}
          unlockedAchievements={unlockedAchievements}
          onClose={() => setShowExportPicker(false)}
        />
      )}
    </div>
  );
}
