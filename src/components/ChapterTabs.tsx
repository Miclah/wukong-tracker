import type { Chapter } from '../types'

interface Tab {
  value: Chapter | 0   // 0 = All
  zh: string
  en: string
}

const TABS: Tab[] = [
  { value: 0, zh: '全部', en: 'All' },
  { value: 1, zh: '第一回', en: 'Chapter 1' },
  { value: 2, zh: '第二回', en: 'Chapter 2' },
  { value: 3, zh: '第三回', en: 'Chapter 3' },
  { value: 4, zh: '第四回', en: 'Chapter 4' },
  { value: 5, zh: '第五回', en: 'Chapter 5' },
  { value: 6, zh: '第六回', en: 'Chapter 6' },
]

interface Props {
  active: Chapter | 0
  onChange: (chapter: Chapter | 0) => void
  showAll?: boolean
}

export function ChapterTabs({ active, onChange, showAll = true }: Props) {
  const visibleTabs = showAll ? TABS : TABS.filter(t => t.value !== 0)
  return (
    <div
      role="tablist"
      aria-label="Filter by chapter"
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {visibleTabs.map(tab => {
        const isActive = tab.value === active
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={[
              'flex items-center gap-2 px-[18px] py-2.5 rounded-md shrink-0',
              'text-title-sm font-sans transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
              isActive
                ? 'bg-parchment-aged text-ink'
                : 'bg-transparent text-parchment-text-mute border border-hairline-dark hover:text-parchment-text hover:border-hairline',
            ].join(' ')}
          >
            <span className="font-zh text-zh leading-none">{tab.zh}</span>
            <span className="leading-none">{tab.en}</span>
          </button>
        )
      })}
    </div>
  )
}
