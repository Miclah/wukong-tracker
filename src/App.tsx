import { useState } from 'react';
import { bosses } from './data/bosses';
import { useTrackerStore } from './store/useTrackerStore';
import { ChapterTabs } from './components/ChapterTabs';
import { BossDetailModal } from './components/BossDetailModal';
import { BossGridView } from './views/BossGridView';
import { StatsDashboardView } from './views/StatsDashboardView';
import type { Boss } from './types';

type RootTab = 'bosses' | 'tally' | 'map';

const ROOT_TABS: { id: RootTab; label: string }[] = [
  { id: 'bosses', label: 'Bosses' },
  { id: 'tally', label: 'The Tally' },
  { id: 'map', label: 'Map' },
];

export default function App() {
  const [rootTab, setRootTab] = useState<RootTab>('bosses');
  const [chapter, setChapter] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);

  const progress = useTrackerStore((s) => s.progress);

  const visibleBosses =
    chapter === 0 ? bosses : bosses.filter((b) => b.chapter === chapter);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-canvas-soft border-b border-hairline-dark sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Title row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-baseline gap-3">
              <span className="font-zh text-[18px] text-parchment-text-mute">受難</span>
              <h1 className="font-display text-[18px] font-medium tracking-widest uppercase text-parchment-text">
                The Suffering
              </h1>
            </div>
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
            <div className="bg-canvas-soft border-b border-hairline-dark sticky top-[89px] z-20">
              <div className="max-w-[1280px] mx-auto px-4 py-3">
                <ChapterTabs active={chapter} onChange={setChapter} />
              </div>
            </div>
            <div className="max-w-[1280px] mx-auto px-4 py-6">
              <BossGridView
                bosses={visibleBosses}
                progress={progress}
                onBossClick={setSelectedBoss}
              />
            </div>
          </>
        )}

        {rootTab === 'tally' && <StatsDashboardView />}

        {rootTab === 'map' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <span className="font-zh text-[48px] text-parchment-text-mute opacity-30">地圖</span>
            <p className="font-display text-[22px] font-medium text-parchment-text-mute tracking-[0.3px]">
              Map view — coming soon
            </p>
            <p className="font-sans text-[13px] text-parchment-text-mute">
              Chapter maps with boss markers arrive in Phase 4b.
            </p>
          </div>
        )}
      </main>

      {/* ── Boss detail modal ───────────────────────────────────── */}
      <BossDetailModal boss={selectedBoss} onClose={() => setSelectedBoss(null)} />
    </div>
  );
}
