import type { Boss, BossProgress } from '../types'

interface Props {
  boss: Boss
  progress?: BossProgress
  onClick?: () => void
}

const CHAPTER_LABEL: Record<number, string> = {
  1: 'Ch. 1', 2: 'Ch. 2', 3: 'Ch. 3',
  4: 'Ch. 4', 5: 'Ch. 5', 6: 'Ch. 6',
}

const TYPE_LABEL: Record<Boss['type'], string> = {
  'yaoguai-king':  'Yaoguai King',
  'yaoguai-chief': 'Yaoguai Chief',
  'elite-yaoguai': 'Elite Yaoguai',
  'hidden':        'Hidden',
  'final':         'Final Boss',
}

function TypeTag({ type }: { type: Boss['type'] }) {
  const base = 'text-caption-uc font-sans font-semibold px-2 py-0.5 rounded-sm'
  const label = TYPE_LABEL[type]

  switch (type) {
    case 'yaoguai-king':
      return <span className={`${base} bg-primary/10 text-primary`}>{label}</span>
    case 'yaoguai-chief':
      return <span className={`${base} bg-gold/10 text-ink-mute`}>{label}</span>
    case 'elite-yaoguai':
      return <span className={`${base} bg-parchment-aged text-ink-mute`}>{label}</span>
    case 'hidden':
      return <span className={`${base} bg-parchment-aged text-ink-mute border border-dashed border-ink-mute/50`}>{label}</span>
    case 'final':
      return <span className={`${base} bg-gold/20 text-gold`}>{label}</span>
  }
}

function InlineSeal() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="60" height="60" fill="#c4453a" rx="2" />
      <rect x="3.5" y="3.5" width="53" height="53" fill="none" stroke="#f5e9d4" strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="5" x2="30" y2="55" stroke="#f5e9d4" strokeWidth="0.75" opacity="0.35" />
      <line x1="5" y1="30" x2="55" y2="30" stroke="#f5e9d4" strokeWidth="0.75" opacity="0.35" />
      <rect x="8" y="8" width="19" height="19" rx="1" fill="#f5e9d4" opacity="0.12" />
      <rect x="33" y="8" width="19" height="19" rx="1" fill="#f5e9d4" opacity="0.12" />
      <rect x="8" y="33" width="19" height="19" rx="1" fill="#f5e9d4" opacity="0.12" />
      <rect x="33" y="33" width="19" height="19" rx="1" fill="#f5e9d4" opacity="0.12" />
    </svg>
  )
}

export function BossCard({ boss, progress, onClick }: Props) {
  const deaths = progress?.attempts.filter(a => a.type === 'death').length ?? 0
  const defeated = progress?.defeated ?? false

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${boss.name} — ${deaths} deaths${defeated ? ', vanquished' : ''}`}
      className={[
        'group w-full text-left rounded-lg border border-hairline overflow-hidden',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        defeated
          ? 'bg-parchment-stained'
          : 'bg-parchment hover:bg-parchment-aged hover:-translate-y-0.5 hover:shadow-card-lift',
      ].join(' ')}
    >
      {/* Art — 16:9 to match downloaded images */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={boss.imageUrl}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {defeated && (
          <div className="absolute bottom-3 right-3 opacity-30 -rotate-3 pointer-events-none">
            <InlineSeal />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-caption-uc font-sans font-semibold px-2 py-0.5 rounded-sm bg-parchment-aged text-ink-faded">
            {CHAPTER_LABEL[boss.chapter]}
          </span>
          <TypeTag type={boss.type} />
        </div>

        {/* Boss name */}
        <h3 className="font-display text-display-md font-medium text-ink leading-tight mb-0.5">
          {defeated && <span className="text-jade mr-1.5">✓</span>}
          {boss.name}
        </h3>

        {/* Chinese subtitle */}
        <p className="font-zh text-zh text-ink-mute mb-4">{boss.nameZh}</p>

        {/* Death counter */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-counter-md font-bold text-ink">{deaths}</span>
          {defeated ? (
            <span className="text-caption-uc font-sans font-semibold text-jade">
              vanquished
            </span>
          ) : (
            <span className="text-caption text-ink-faded">deaths</span>
          )}
        </div>
      </div>
    </button>
  )
}
