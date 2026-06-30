import { useEffect, useRef, useState } from 'react'
import type { Boss, Difficulty } from '../types'
import { useTrackerStore } from '../store/useTrackerStore'
import { useSharedStore } from '../store/useSharedStore'
import { useViewProgress } from '../hooks/useViewState'
import { useGifDrawerStore } from '../store/useGifDrawerStore'
import { InkBlotImage } from '../components/InkBlotImage'
import { DifficultyRating } from '../components/DifficultyRating'
import { SealStamp } from '../components/SealStamp'
import { JournalTimeline } from '../components/JournalTimeline'

// ── Inline markdown renderer ─────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[0].startsWith('**')) {
      parts.push(<strong key={m.index} className="font-semibold text-ink">{m[2]}</strong>)
    } else {
      parts.push(<em key={m.index}>{m[3]}</em>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const out: React.ReactNode[] = []
  let listBuf: string[] = []

  const flushList = (key: number) => {
    if (!listBuf.length) return
    out.push(
      <ul key={`ul-${key}`} className="list-disc ml-4 my-1 space-y-0.5">
        {listBuf.map((item, j) => (
          <li key={j} className="font-sans text-body-sm text-ink-soft leading-snug">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    )
    listBuf = []
  }

  lines.forEach((line, i) => {
    if (/^## /.test(line)) {
      flushList(i)
      out.push(<h4 key={i} className="font-display text-title-sm font-medium text-ink mt-3 mb-0.5">{line.slice(3)}</h4>)
    } else if (/^# /.test(line)) {
      flushList(i)
      out.push(<h3 key={i} className="font-display text-title-md font-medium text-ink mt-4 mb-1">{line.slice(2)}</h3>)
    } else if (/^[-*] /.test(line)) {
      listBuf.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList(i)
      out.push(<div key={i} className="h-1.5" />)
    } else {
      flushList(i)
      out.push(<p key={i} className="font-sans text-body-sm text-ink-soft leading-relaxed">{renderInline(line)}</p>)
    }
  })
  flushList(lines.length)
  return <>{out}</>
}

// ── Metadata ─────────────────────────────────────────────────────────────────
const CHAPTER_ZH: Record<number, string> = {
  1: '第一回', 2: '第二回', 3: '第三回',
  4: '第四回', 5: '第五回', 6: '第六回',
}

type TagStyle = { label: string; className: string }

const TYPE_TAG: Record<string, TagStyle> = {
  'yaoguai-king':  { label: 'Yaoguai King',  className: 'bg-primary/10 text-primary border border-primary/20' },
  'yaoguai-chief': { label: 'Yaoguai Chief', className: 'bg-gold/10 text-gold border border-gold/20' },
  'elite-yaoguai': { label: 'Elite Yaoguai', className: 'bg-parchment-aged text-ink-mute border border-hairline' },
  hidden:          { label: 'Hidden',         className: 'bg-parchment-aged text-ink-mute border border-dashed border-hairline' },
  final:           { label: 'Final Boss',     className: 'bg-primary/10 text-primary border border-primary/20' },
}

type ActiveFlow = 'death' | 'vanquish' | null

interface Props {
  boss: Boss
  navigate: (to: string) => void
}

export function BossDetailPage({ boss, navigate }: Props) {
  const allProgress       = useViewProgress()
  const progress          = allProgress[boss.id]
  const isReadOnly        = useSharedStore((s) => s.isReadOnly)
  const logAttempt        = useTrackerStore((s) => s.logAttempt)
  const markDefeated      = useTrackerStore((s) => s.markDefeated)
  const setBossNotes      = useTrackerStore((s) => s.setBossNotes)
  const setBossDifficulty = useTrackerStore((s) => s.setBossDifficulty)
  const gifPickerEnabled  = useTrackerStore((s) => s.reactionsEnabled)
  const openDrawer        = useGifDrawerStore((s) => s.openDrawer)

  const deathCount = progress?.attempts.filter((a) => a.type === 'death').length ?? 0
  const defeated   = progress?.defeated ?? false
  const tag        = TYPE_TAG[boss.type]

  const [activeFlow,   setActiveFlow]   = useState<ActiveFlow>(null)
  const [note,         setNote]         = useState('')
  const [fightTime,    setFightTime]    = useState('')
  const [notesEditing, setNotesEditing] = useState(false)
  const [notesDraft,   setNotesDraft]   = useState('')
  const noteInputRef = useRef<HTMLInputElement>(null)
  const notesAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setActiveFlow(null)
    setNote('')
    setFightTime('')
    setNotesEditing(false)
  }, [boss.id])

  useEffect(() => {
    if (activeFlow && !gifPickerEnabled) noteInputRef.current?.focus()
  }, [activeFlow, gifPickerEnabled])

  useEffect(() => {
    if (notesEditing) notesAreaRef.current?.focus()
  }, [notesEditing])

  // Called by the no-GIF inline form (gifPickerEnabled=false path)
  function handleNoteLog() {
    const mins    = parseFloat(fightTime)
    const noteVal = note.trim() || undefined
    const ft      = mins > 0 ? mins : undefined
    if (activeFlow === 'death') {
      logAttempt(boss.id, { type: 'death', note: noteVal, fightTimeMinutes: ft })
    } else if (activeFlow === 'vanquish') {
      markDefeated(boss.id, { note: noteVal, fightTimeMinutes: ft })
    }
    setActiveFlow(null)
    setNote('')
    setFightTime('')
  }

  function handleDeathClick() {
    if (gifPickerEnabled) {
      openDrawer({
        type: 'death',
        onCommit: (gif, noteArg, fightTimeMinutes) => {
          logAttempt(boss.id, {
            type: 'death',
            note: noteArg || undefined,
            gif: gif ?? undefined,
            fightTimeMinutes,
          })
        },
      })
    } else {
      setActiveFlow('death')
    }
  }

  function handleVanquishClick() {
    if (gifPickerEnabled) {
      openDrawer({
        type: 'kill',
        onCommit: (gif, noteArg, fightTimeMinutes) => {
          markDefeated(boss.id, {
            note: noteArg || undefined,
            gif: gif ?? undefined,
            fightTimeMinutes,
          })
        },
      })
    } else {
      setActiveFlow('vanquish')
    }
  }

  const focalStyle = {
    objectPosition: `${(boss.focalPoint?.x ?? 0.5) * 100}% ${(boss.focalPoint?.y ?? 0.5) * 100}%`,
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 font-sans text-body-sm text-ink-faded hover:text-parchment-text transition-colors mb-6"
        aria-label="Back to bosses"
      >
        ← Back to bosses
      </button>

      {/* ── Hero: image (left) + info panel (right) ── */}
      <div className="lg:flex gap-8">

        {/* Left column: sticky boss image on desktop, full-width on mobile */}
        <div className="lg:w-[40%] flex-shrink-0 lg:sticky lg:top-36 lg:self-start">
          <div className="relative h-[280px] lg:h-[520px] bg-ink-soft overflow-hidden rounded-lg border border-hairline">
            <InkBlotImage
              src={boss.imageUrl}
              alt={boss.name}
              className="w-full h-full object-cover"
              style={focalStyle}
            />
            {/* Vignette: fades to canvas on the right on desktop, bottom on mobile */}
            <div
              className="absolute inset-0 hidden lg:block pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent 55%, rgb(var(--color-canvas-rgb)) 100%)' }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 block lg:hidden pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent 50%, rgb(var(--color-canvas-rgb)) 100%)' }}
              aria-hidden="true"
            />
            {defeated && (
              <div className="absolute bottom-4 right-4 opacity-80">
                <SealStamp size={72} />
              </div>
            )}
          </div>
        </div>

        {/* Right column: info + actions + notes + journal */}
        <div className="lg:flex-1 mt-6 lg:mt-0 min-w-0">

          {/* Boss name */}
          <h1
            className="font-display font-semibold text-parchment-text leading-tight"
            style={{ fontSize: '2.5rem' }}
          >
            {boss.name}
          </h1>
          <p className="font-zh mt-1 text-primary" style={{ fontSize: '1.4rem' }}>
            {boss.nameZh}
          </p>

          {/* Location + chapter */}
          <p className="font-sans text-body-sm text-ink-faded mt-3">
            {`Chapter ${boss.chapter}`}
            <span className="mx-2 text-hairline">·</span>
            {CHAPTER_ZH[boss.chapter]}
            <span className="mx-2 text-hairline">·</span>
            {boss.location}
          </p>

          {/* Type badge */}
          {tag && (
            <span className={`mt-3 inline-block font-sans text-caption-uc uppercase tracking-[1.2px] rounded-sm px-2 py-0.5 ${tag.className}`}>
              {tag.label}
            </span>
          )}

          {/* Difficulty */}
          <div className="mt-5 flex items-center gap-3">
            <span className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded">
              Difficulty
            </span>
            <DifficultyRating
              value={(progress?.difficulty ?? 0) as Difficulty}
              onChange={isReadOnly ? undefined : (v) => setBossDifficulty(boss.id, v)}
              readonly={isReadOnly}
            />
          </div>

          <div className="mt-5 border-t border-hairline" />

          {/* Death count */}
          <div className="mt-5">
            <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded mb-1">
              Deaths
            </p>
            <p className="font-mono font-bold text-parchment-text leading-none" style={{ fontSize: '3rem' }}>
              {deathCount}
            </p>
            {defeated && (
              <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-jade mt-2">
                Vanquished in {progress!.defeatedAtDeathCount} death
                {progress!.defeatedAtDeathCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Action buttons — hidden in read-only mode */}
          {!isReadOnly && <div className="mt-6 flex flex-col gap-3">
            {activeFlow ? (
              // Non-GIF inline form (only shown when gifPickerEnabled is false)
              <div className="flex flex-col gap-2 bg-canvas/30 rounded-md p-3 border border-hairline">
                <div className="flex gap-2">
                  <input
                    ref={noteInputRef}
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleNoteLog() }}
                    placeholder="What happened… (optional)"
                    aria-label="Attempt note"
                    className="flex-1 rounded-md bg-canvas border border-hairline-dark px-3 py-2 font-sans text-body-md text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={fightTime}
                    onChange={(e) => setFightTime(e.target.value)}
                    placeholder="min"
                    aria-label="Fight duration in minutes"
                    className="w-16 rounded-md bg-canvas border border-hairline-dark px-2 py-2 font-mono text-body-md text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60 text-center"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleNoteLog}
                    className="flex-1 h-9 rounded-md bg-primary text-on-vermilion font-sans text-btn tracking-[0.3px] hover:bg-primary-active transition-colors"
                  >
                    Log
                  </button>
                  <button
                    onClick={() => { setActiveFlow(null); setNote(''); setFightTime('') }}
                    className="px-4 h-9 rounded-md font-sans text-btn text-ink-mute hover:bg-parchment-aged transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleDeathClick}
                  disabled={defeated}
                  aria-label="Log a death"
                  className="h-12 w-full rounded-md border border-primary/40 bg-canvas font-sans text-btn text-parchment-text tracking-[0.3px] transition-colors hover:border-primary/70 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  I have died once more
                </button>
                {defeated ? (
                  <div
                    aria-label="Boss defeated"
                    className="h-12 w-full rounded-md border border-jade/40 flex items-center justify-center gap-2 font-sans text-btn text-jade tracking-[0.3px]"
                  >
                    <span>✓</span>
                    <span>Vanquished</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVanquishClick}
                    aria-label="Mark as vanquished"
                    className="h-12 w-full rounded-md bg-primary text-on-vermilion font-sans text-btn tracking-[0.3px] hover:bg-primary-active transition-colors"
                  >
                    Vanquished
                  </button>
                )}
              </>
            )}
          </div>}

          {/* Strategy notes */}
          <div className="mt-6 border-t border-hairline" />
          <div className="mt-4 flex items-center justify-between mb-2">
            <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded">
              Strategy Notes
            </p>
            {!isReadOnly && !notesEditing && (
              <button
                onClick={() => { setNotesDraft(progress?.notes ?? ''); setNotesEditing(true) }}
                aria-label="Edit strategy notes"
                className="text-ink-faded hover:text-ink-mute transition-colors font-sans text-caption px-2 py-0.5 rounded hover:bg-parchment-aged"
              >
                ✎ Edit
              </button>
            )}
          </div>
          {!isReadOnly && notesEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                ref={notesAreaRef}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Strategy notes, weaknesses, salty venting… Markdown supported."
                aria-label="Strategy notes"
                rows={6}
                className="w-full rounded-md bg-canvas border border-hairline-dark px-3 py-2 font-sans text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60 resize-y"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setBossNotes(boss.id, notesDraft); setNotesEditing(false) }}
                  className="flex-1 h-9 rounded-md bg-primary text-on-vermilion font-sans text-btn tracking-[0.3px] hover:bg-primary-active transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setNotesEditing(false)}
                  className="px-4 h-9 rounded-md font-sans text-btn text-ink-mute hover:bg-parchment-aged transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : progress?.notes ? (
            <div
              className={isReadOnly ? undefined : 'cursor-pointer'}
              onClick={isReadOnly ? undefined : () => { setNotesDraft(progress.notes ?? ''); setNotesEditing(true) }}
              role={isReadOnly ? undefined : 'button'}
              tabIndex={isReadOnly ? undefined : 0}
              onKeyDown={isReadOnly ? undefined : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setNotesDraft(progress.notes ?? '')
                  setNotesEditing(true)
                }
              }}
            >
              {renderMarkdown(progress.notes)}
            </div>
          ) : !isReadOnly ? (
            <button
              onClick={() => { setNotesDraft(''); setNotesEditing(true) }}
              className="w-full text-left font-sans text-body-sm text-ink-faded italic hover:text-ink-mute transition-colors py-1"
            >
              Add strategy notes…
            </button>
          ) : null}

          {/* ── Battle Journal ─────────────────────────────────────── */}
          <div className="mt-8 border-t border-hairline pt-6">
            <h2 className="font-display text-[1.25rem] font-medium text-parchment-text mb-6">
              Battle Journal
            </h2>
            <JournalTimeline attempts={progress?.attempts ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}
