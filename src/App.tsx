import { useState, useEffect } from 'react';
import { bosses } from './data/bosses';
import { useTrackerStore } from './store/useTrackerStore';
import { useSharedStore } from './store/useSharedStore';
import { useSharedStateLoad } from './hooks/useSharedStateLoad';
import { useAchievementWatcher } from './hooks/useAchievementWatcher';
import { ChapterTabs } from './components/ChapterTabs';
import { BossDetailModal } from './components/BossDetailModal';
import { AchievementToast } from './components/AchievementToast';
import { BossGridView } from './views/BossGridView';
import { StatsDashboardView } from './views/StatsDashboardView';
import { SharedStatsView } from './views/SharedStatsView';
import { MapView } from './views/MapView';
import { MountainBackdrop } from './components/atmosphere/MountainBackdrop';
import { EmberGlow } from './components/atmosphere/EmberGlow';
import { CalligraphyRain } from './components/atmosphere/CalligraphyRain';
import { FloatingSeal } from './components/atmosphere/FloatingSeal';
import { PROVERBS } from './data/proverbs';
import type { Boss } from './types';

type RootTab = 'bosses' | 'tally' | 'map';

const ROOT_TABS: { id: RootTab; label: string }[] = [
  { id: 'bosses', label: 'Bosses' },
  { id: 'tally', label: 'The Tally' },
  { id: 'map', label: 'Map' },
];

const SESSION_PROVERB = PROVERBS[Math.floor(Math.random() * PROVERBS.length)];

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
    [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I'],
  ];
  let result = '';
  for (const [val, sym] of map) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result || 'I';
}

export default function App() {
  useSharedStateLoad();
  const { current: toastAchievement, dismissToast } = useAchievementWatcher();

  const sharedSummary = useSharedStore((s) => s.sharedSummary);

  const [rootTab, setRootTab] = useState<RootTab>('bosses');
  const [chapter, setChapter] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);

  const progress            = useTrackerStore((s) => s.progress);
  const gifPickerEnabled    = useTrackerStore((s) => s.reactionsEnabled);
  const setGifPickerEnabled = useTrackerStore((s) => s.setReactionsEnabled);
  const theme               = useTrackerStore((s) => s.theme);
  const setTheme            = useTrackerStore((s) => s.setTheme);

  // Apply theme class to <html> so CSS variables take effect
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Shared link takes over the entire view — user data is never shown or touched
  if (sharedSummary) {
    return (
      <div className="min-h-screen flex flex-col">
        <MountainBackdrop />
        <EmberGlow />
        <CalligraphyRain />
        <header className="bg-canvas-soft border-b border-hairline-dark sticky top-0 z-30">
          <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center gap-3">
            <span className="font-zh text-[18px] text-parchment-text-mute">受難</span>
            <h1 className="font-display text-[18px] font-medium tracking-widest uppercase text-parchment-text">
              The Suffering
            </h1>
            <span className="ml-auto font-sans text-[11px] font-semibold tracking-[1.2px] uppercase text-primary border border-primary/40 rounded px-2 py-0.5">
              Shared
            </span>
          </div>
        </header>
        <main className="flex-1">
          <SharedStatsView />
        </main>
      </div>
    );
  }

  const allProgress = Object.values(progress);
  const totalDeaths = allProgress.reduce(
    (sum, p) => sum + p.attempts.filter((a) => a.type === 'death').length, 0,
  );
  const totalKills = allProgress.filter((p) => p.defeated).length;
  const allAttempts = allProgress.flatMap((p) => p.attempts);
  const firstTs = allAttempts.length
    ? Math.min(...allAttempts.map((a) => a.timestamp))
    : null;
  const dayOfPilgrimage = firstTs
    ? Math.floor((Date.now() - firstTs) / 86_400_000) + 1
    : 1;

  const CHAPTER_NUMERALS = ['一', '二', '三', '四', '五', '六'] as const;
  const chapterStates = ([1, 2, 3, 4, 5, 6] as const).map((ch) => {
    const chBosses = bosses.filter((b) => b.chapter === ch);
    const hasAnyAttempt = chBosses.some((b) => (progress[b.id]?.attempts.length ?? 0) > 0);
    if (!hasAnyAttempt) return 'untouched' as const;
    const allDefeated = chBosses.every((b) => progress[b.id]?.defeated);
    return allDefeated ? 'cleared' as const : 'active' as const;
  });

  const visibleBosses =
    chapter === 0 ? bosses : bosses.filter((b) => b.chapter === chapter);

  return (
    <div className="min-h-screen flex flex-col">
      <MountainBackdrop />
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-canvas-soft border-b border-hairline-dark sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Three-column title row */}
          <div className="grid grid-cols-3 items-center py-3 gap-4">

            {/* Left: logo + counters */}
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <span className="font-zh text-[18px] text-parchment-text-mute">受難</span>
                <h1 className="font-display text-[18px] font-medium tracking-widest uppercase text-parchment-text">
                  The Suffering
                </h1>
              </div>
              <div className="flex items-center gap-2 font-zh text-[13px]">
                <span className="text-primary">受難</span>
                <span className="font-mono text-primary font-semibold">{totalDeaths}</span>
                <span className="text-parchment-text-mute opacity-40">·</span>
                <span className="text-jade">受勝</span>
                <span className="font-mono text-jade font-semibold">{totalKills}</span>
                <span className="text-parchment-text-mute opacity-40">·</span>
                <span className="text-parchment-text-mute">日</span>
                <span className="font-mono text-parchment-text-mute font-semibold">{toRoman(dayOfPilgrimage)}</span>
              </div>
            </div>

            {/* Center: rotating proverb */}
            <div className="hidden md:flex justify-center">
              <p className="font-display-alt italic text-[13px] text-parchment-text-mute text-center leading-snug opacity-70">
                {SESSION_PROVERB}
              </p>
            </div>

            {/* Right: toggles */}
            <div className="flex items-center justify-end gap-3">
              {/* GIF picker toggle */}
              <div className="border border-hairline rounded px-2 py-1 flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="font-sans text-[12px] text-parchment-text-mute hidden sm:inline">GIF</span>
                  <button
                    role="switch"
                    aria-checked={gifPickerEnabled}
                    aria-label="Toggle GIF picker"
                    onClick={() => setGifPickerEnabled(!gifPickerEnabled)}
                    className={[
                      'relative w-10 h-5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
                      gifPickerEnabled
                        ? 'bg-primary border-primary'
                        : 'bg-canvas border-hairline',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
                        gifPickerEnabled
                          ? 'translate-x-5 bg-on-vermilion'
                          : 'translate-x-0.5 bg-ink-faded',
                      ].join(' ')}
                    />
                  </button>
                </label>
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="border border-hairline rounded w-8 h-8 flex items-center justify-center text-parchment-text-mute hover:text-parchment-text hover:border-hairline-dark transition-colors text-[16px]"
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            </div>
          </div>

          {/* Chapter progress seals strip */}
          <div className="flex items-center gap-2 py-2 border-t border-hairline-dark/50">
            {CHAPTER_NUMERALS.map((numeral, i) => {
              const ch = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6;
              const state = chapterStates[i];
              return (
                <button
                  key={ch}
                  onClick={() => { setChapter(ch); setRootTab('bosses'); }}
                  aria-label={`Chapter ${ch} — ${state}`}
                  title={`Chapter ${ch}`}
                  className={[
                    'relative w-8 h-8 rounded-sm font-zh text-[14px] flex items-center justify-center border transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50',
                    state === 'cleared'
                      ? 'bg-primary border-primary text-on-vermilion'
                      : state === 'active'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-transparent border-hairline text-parchment-text-mute opacity-40 hover:opacity-70',
                  ].join(' ')}
                >
                  {numeral}
                  {state === 'cleared' && (
                    <span className="absolute -top-1 -right-1 text-[9px] leading-none text-on-vermilion font-sans font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Root tab row */}
          <div className="flex gap-0 border-t border-hairline-dark" role="tablist" aria-label="Main navigation">
            {ROOT_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={rootTab === tab.id}
                onClick={() => setRootTab(tab.id)}
                className={[
                  'px-5 py-2.5 font-sans text-[13px] font-semibold tracking-[1.2px] uppercase transition-colors border-b-2',
                  rootTab === tab.id
                    ? 'border-primary text-parchment-text'
                    : 'border-transparent text-parchment-text-mute hover:text-parchment-text',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="flex-1">
        {rootTab === 'bosses' && (
          <>
            <div className="bg-canvas-soft border-b border-hairline-dark sticky top-[149px] z-20">
              <div className="max-w-[1280px] mx-auto px-4 py-3">
                <ChapterTabs active={chapter} onChange={setChapter} />
              </div>
            </div>
            <div className="relative max-w-[1280px] mx-auto px-4 py-6">
              <FloatingSeal image="/textures/seal-suffering.png" />
              <BossGridView
                bosses={visibleBosses}
                progress={progress}
                onBossClick={setSelectedBoss}
              />
            </div>
          </>
        )}

        {rootTab === 'tally' && (
          <div className="relative">
            <FloatingSeal image="/textures/seal-tally.png" />
            <StatsDashboardView />
          </div>
        )}

        {rootTab === 'map' && (
          <div className="relative">
            <FloatingSeal image="/textures/seal-map.png" />
            <MapView onBossClick={setSelectedBoss} />
          </div>
        )}
      </main>

      {/* ── Boss detail modal ───────────────────────────────────── */}
      <BossDetailModal boss={selectedBoss} onClose={() => setSelectedBoss(null)} />

      {/* ── Achievement toast ───────────────────────────────────── */}
      {toastAchievement && (
        <AchievementToast
          key={toastAchievement.id}
          achievement={toastAchievement}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}
