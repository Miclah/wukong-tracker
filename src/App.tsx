import { useState } from 'react'
import { bosses } from './data/bosses'
import { BossGridView } from './views/BossGridView'
import { ChapterTabs } from './components/ChapterTabs'
import type { Boss, Chapter } from './types'

export default function App() {
  const [activeChapter, setActiveChapter] = useState<Chapter | 0>(0)

  const visibleBosses = activeChapter === 0
    ? bosses
    : bosses.filter(b => b.chapter === activeChapter)

  function handleBossClick(boss: Boss) {
    // wired in phase 2
    console.log('clicked', boss.id)
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="py-10 text-center">
        <h1 className="font-display text-display-xl font-medium text-parchment-text tracking-wide">
          受難
        </h1>
        <p className="font-display text-display-sm font-medium text-parchment-text-mute tracking-widest uppercase mt-1">
          The Suffering
        </p>
      </header>

      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mb-6">
          <ChapterTabs active={activeChapter} onChange={setActiveChapter} />
        </div>
        <BossGridView
          bosses={visibleBosses}
          progress={{}}
          onBossClick={handleBossClick}
        />
      </section>
    </main>
  )
}
