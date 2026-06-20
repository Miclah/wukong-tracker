import { BossCard } from '../components/BossCard'
import type { Boss, BossProgress } from '../types'

interface Props {
  bosses: Boss[]
  progress: Record<string, BossProgress>
  onBossClick: (boss: Boss) => void
}

export function BossGridView({ bosses, progress, onBossClick }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {bosses.map(boss => (
        <BossCard
          key={boss.id}
          boss={boss}
          progress={progress[boss.id]}
          onClick={() => onBossClick(boss)}
        />
      ))}
    </div>
  )
}
