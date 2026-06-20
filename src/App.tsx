import { bosses } from './data/bosses'
import { BossGridView } from './views/BossGridView'
import type { Boss } from './types'

export default function App() {
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
        <BossGridView
          bosses={bosses}
          progress={{}}
          onBossClick={handleBossClick}
        />
      </section>
    </main>
  )
}
