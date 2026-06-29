import { useState, useEffect } from 'react';
import { bosses } from './data/bosses';
import { useTrackerStore } from './store/useTrackerStore';
import { useSharedStore } from './store/useSharedStore';
import { useSharedStateLoad } from './hooks/useSharedStateLoad';
import { useAchievementWatcher } from './hooks/useAchievementWatcher';
import { useHashRoute } from './hooks/useHashRoute';
import { ChapterTabs } from './components/ChapterTabs';
import { AchievementToast } from './components/AchievementToast';
import { BossGridView } from './views/BossGridView';
import { StatsDashboardView } from './views/StatsDashboardView';
import { SharedStatsView } from './views/SharedStatsView';
import { MapView } from './views/MapView';
import { BossDetailPage } from './views/BossDetailPage';
import { MountainBackdrop } from './components/atmosphere/MountainBackdrop';
import { EmberGlow } from './components/atmosphere/EmberGlow';
import { CalligraphyRain } from './components/atmosphere/CalligraphyRain';
import { FloatingSeal } from './components/atmosphere/FloatingSeal';
import { FocalPointPicker } from './components/dev/FocalPointPicker';
import GifPickerDrawer from './components/GifPickerDrawer';
import { PROVERBS } from './data/proverbs';

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
  const { route, navigate } = useHashRoute();

  const sharedSummary = useSharedStore((s) => s.sharedSummary);

  const [chapter, setChapter] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);

  // Derive section from hash route
  const bossPageId = route.startsWith('/boss/') ? route.slice(6) : null;
  const bossForPage = bossPageId ? (bosses.find((b) => b.id === bossPageId) ?? null) : null;
  const rootTab: RootTab = route === '/tally' ? 'tally' : route === '/map' ? 'map' : 'bosses';

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
      <EmberGlow />
      <CalligraphyRain />
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-canvas-soft border-b border-hairline-dark sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Three-column title row */}
          <div className="grid grid-cols-3 items-center py-3 gap-4">

            {/* Left: logo + counters */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-zh text-[15px] text-parchment-text-mute">受難</span>
                <h1 className="font-display text-[22px] font-semibold tracking-widest uppercase text-parchment-text">
                  The Suffering
                </h1>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="flex items-center gap-1">
                  <span className="font-mono font-bold text-primary text-[15px]">{totalDeaths}</span>
                  <span className="text-parchment-text-mute">deaths</span>
                </span>
                <span className="text-hairline">·</span>
                <span className="flex items-center gap-1">
                  <span className="font-mono font-bold text-jade text-[15px]">{totalKills}</span>
                  <span className="text-parchment-text-mute">kills</span>
                </span>
                <span className="text-hairline">·</span>
                <span className="flex items-center gap-1">
                  <span className="font-mono font-bold text-parchment-text-mute text-[15px]">{toRoman(dayOfPilgrimage)}</span>
                  <span className="text-parchment-text-mute">day</span>
                </span>
              </div>
            </div>

            {/* Center: rotating proverb */}
            <div className="hidden md:flex justify-center items-center px-2 self-stretch">
              <p className="font-display-alt italic text-[22px] text-parchment-text text-center leading-snug tracking-wide">
                {SESSION_PROVERB}
              </p>
            </div>

            {/* Right: toggles */}
            <div className="flex items-center justify-end gap-2">
              {/* GIF picker toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <span className="font-sans text-[11px] tracking-[0.8px] uppercase text-parchment-text-mute">GIF</span>
                <button
                  role="switch"
                  aria-checked={gifPickerEnabled}
                  aria-label="Toggle GIF picker"
                  onClick={() => setGifPickerEnabled(!gifPickerEnabled)}
                  className={[
                    'relative w-10 h-5 rounded-full overflow-hidden transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
                    gifPickerEnabled ? 'bg-primary' : 'bg-hairline',
                  ].join(' ')}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-parchment-text"
                    style={{
                      left: gifPickerEnabled ? 22 : 2,
                      transition: 'left 0.15s',
                    }}
                  />
                </button>
              </label>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="w-8 h-8 flex items-center justify-center rounded text-parchment-text-mute hover:text-parchment-text hover:bg-hairline/20 transition-colors text-[16px]"
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            </div>
          </div>

          {/* Chapter progress seals strip */}
          <div className="flex items-center gap-1.5 py-2 border-t border-hairline-dark/50">
            {CHAPTER_NUMERALS.map((numeral, i) => {
              const ch = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6;
              const state = chapterStates[i];
              return (
                <button
                  key={ch}
                  onClick={() => { setChapter(ch); navigate('/'); }}
                  aria-label={`Chapter ${ch} — ${state}`}
                  title={`Chapter ${ch}`}
                  className={[
                    'relative flex flex-col items-center justify-center px-2 py-1 rounded-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50 leading-none gap-0.5',
                    state === 'cleared'
                      ? 'bg-primary border-primary text-on-vermilion'
                      : state === 'active'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-transparent border-hairline text-parchment-text-mute opacity-50 hover:opacity-80',
                  ].join(' ')}
                >
                  <span className="font-zh text-[11px]">{numeral}</span>
                  <span className="font-sans text-[9px] tracking-[0.5px] opacity-80">Ch.{ch}</span>
                  {state === 'cleared' && (
                    <span className="absolute -top-1 -right-1 text-[9px] leading-none font-sans font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Root tab row */}
          <div className="flex gap-0 border-t border-hairline-dark" role="tablist" aria-label="Main navigation">
            {ROOT_TABS.map((tab) => {
              const isActive = tab.id === rootTab && !bossForPage;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => navigate(tab.id === 'bosses' ? '/' : '/' + tab.id)}
                  className={[
                    'px-5 py-2.5 font-sans text-[13px] font-semibold tracking-[1.2px] uppercase transition-colors border-b-2',
                    isActive
                      ? 'border-primary text-parchment-text'
                      : 'border-transparent text-parchment-text-mute hover:text-parchment-text',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="flex-1">
        {bossForPage ? (
          <BossDetailPage boss={bossForPage} navigate={navigate} />
        ) : (
          <>
            {rootTab === 'bosses' && (
              <div className="relative">
                <FloatingSeal image="/textures/seal-suffering.png" />
                <div className="bg-canvas-soft border-b border-hairline-dark sticky top-[149px] z-20">
                  <div className="max-w-[1280px] mx-auto px-6 py-3">
                    <ChapterTabs active={chapter} onChange={setChapter} />
                  </div>
                </div>
                <div className="max-w-[1280px] mx-auto px-6 py-6">
                  <BossGridView
                    bosses={visibleBosses}
                    progress={progress}
                    onBossClick={(boss) => navigate('/boss/' + boss.id)}
                  />
                </div>
              </div>
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
                <MapView onBossClick={(boss) => navigate('/boss/' + boss.id)} />
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Achievement toast ───────────────────────────────────── */}
      {toastAchievement && (
        <AchievementToast
          key={toastAchievement.id}
          achievement={toastAchievement}
          onDismiss={dismissToast}
        />
      )}

      {/* ── Dev tools (no-op in production unless ?dev= param present) ── */}
      <FocalPointPicker />

      {/* ── GIF picker drawer — mounted at root so it overlays any route ── */}
      <GifPickerDrawer />
    </div>
  );
}
