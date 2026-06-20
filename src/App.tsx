import { BossCard } from './components/BossCard'
import { bosses } from './data/bosses'

export default function App() {
  const samples = bosses.slice(0, 4)

  return (
    <main className="min-h-screen p-8 bg-canvas">
      <h1 className="font-display text-display-xl font-medium text-parchment-text tracking-wide text-center mb-8">
        受難
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {samples.map(boss => (
          <BossCard key={boss.id} boss={boss} />
        ))}
      </div>
    </main>
  )
}
