import { useEffect, useRef, useState } from 'react';
import type { Boss, Difficulty, GifData } from '../types';
import { useTrackerStore } from '../store/useTrackerStore';
import { SealStamp } from './SealStamp';
import { AttemptTimeline } from './AttemptTimeline';
import GifPicker from './GifPicker';
import { InkStrokeRating } from './InkStrokeRating';

// Lightweight markdown renderer — handles headings, bullets, bold, italic
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith('**')) {
      parts.push(<strong key={m.index} className="font-semibold text-ink">{m[2]}</strong>);
    } else {
      parts.push(<em key={m.index}>{m[3]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];

  const flushList = (key: number) => {
    if (listBuf.length === 0) return;
    out.push(
      <ul key={`ul-${key}`} className="list-disc ml-4 my-1 space-y-0.5">
        {listBuf.map((item, j) => (
          <li key={j} className="font-sans text-body-sm text-ink-soft leading-snug">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  lines.forEach((line, i) => {
    if (/^## /.test(line)) {
      flushList(i);
      out.push(<h4 key={i} className="font-display text-title-sm font-medium text-ink mt-3 mb-0.5">{line.slice(3)}</h4>);
    } else if (/^# /.test(line)) {
      flushList(i);
      out.push(<h3 key={i} className="font-display text-title-md font-medium text-ink mt-4 mb-1">{line.slice(2)}</h3>);
    } else if (/^[-*] /.test(line)) {
      listBuf.push(line.slice(2));
    } else if (line.trim() === '') {
      flushList(i);
      out.push(<div key={i} className="h-1.5" />);
    } else {
      flushList(i);
      out.push(<p key={i} className="font-sans text-body-sm text-ink-soft leading-relaxed">{renderInline(line)}</p>);
    }
  });
  flushList(lines.length);
  return <>{out}</>;
}

type Props = {
  boss: Boss | null;
  onClose: () => void;
};

const CHAPTER_ZH: Record<number, string> = {
  1: '第一回',
  2: '第二回',
  3: '第三回',
  4: '第四回',
  5: '第五回',
  6: '第六回',
};

type TagStyle = { label: string; className: string };

const TYPE_TAG: Record<string, TagStyle> = {
  'yaoguai-king':  { label: 'Yaoguai King',  className: 'bg-primary/10 text-primary border border-primary/20' },
  'yaoguai-chief': { label: 'Yaoguai Chief', className: 'bg-gold/10 text-gold border border-gold/20' },
  'elite-yaoguai': { label: 'Elite Yaoguai', className: 'bg-parchment-aged text-ink-mute border border-hairline' },
  hidden:          { label: 'Hidden',         className: 'bg-parchment-aged text-ink-mute border border-dashed border-hairline' },
  final:           { label: 'Final Boss',     className: 'bg-primary/10 text-primary border border-primary/20' },
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

type ActiveFlow = 'death' | 'vanquish' | null;

export function BossDetailModal({ boss, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  const progress            = useTrackerStore((s) => (boss ? s.progress[boss.id] : undefined));
  const logAttempt          = useTrackerStore((s) => s.logAttempt);
  const markDefeated        = useTrackerStore((s) => s.markDefeated);
  const setBossNotes        = useTrackerStore((s) => s.setBossNotes);
  const setBossDifficulty   = useTrackerStore((s) => s.setBossDifficulty);
  const gifPickerEnabled    = useTrackerStore((s) => s.reactionsEnabled);

  const deathCount = progress?.attempts.filter((a) => a.type === 'death').length ?? 0;
  const defeated   = progress?.defeated ?? false;

  const [activeFlow,    setActiveFlow]    = useState<ActiveFlow>(null);
  const [note,          setNote]          = useState('');
  const [fightTime,     setFightTime]     = useState('');
  const [deathFlash,    setDeathFlash]    = useState(false);
  const [vanqFlash,     setVanqFlash]     = useState(false);
  const [notesEditing,  setNotesEditing]  = useState(false);
  const [notesDraft,    setNotesDraft]    = useState('');
  const noteInputRef  = useRef<HTMLInputElement>(null);
  const notesAreaRef  = useRef<HTMLTextAreaElement>(null);

  // Reset flow and notes editor when modal closes or boss changes
  useEffect(() => {
    if (!boss) { setActiveFlow(null); setNote(''); setFightTime(''); setNotesEditing(false); }
    else { setNotesEditing(false); }
  }, [boss]);

  // Auto-focus note input when GIF picker is off
  useEffect(() => {
    if (activeFlow && !gifPickerEnabled) noteInputRef.current?.focus();
  }, [activeFlow, gifPickerEnabled]);

  // Esc: collapse picker → cancel notes edit → close modal
  useEffect(() => {
    if (!boss) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeFlow) {
        e.stopPropagation();
        setActiveFlow(null);
        setNote('');
      } else if (notesEditing) {
        e.stopPropagation();
        setNotesEditing(false);
      } else {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [boss, onClose, activeFlow, notesEditing]);

  // Focus trap (re-queries when picker or notes editor opens/closes)
  useEffect(() => {
    if (!boss || !modalRef.current) return;
    const el    = modalRef.current;
    const nodes = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    nodes[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || nodes.length === 0) return;
      const first = nodes[0];
      const last  = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [boss, activeFlow, notesEditing]);

  // Auto-focus notes textarea when entering edit mode
  useEffect(() => {
    if (notesEditing) notesAreaRef.current?.focus();
  }, [notesEditing]);

  // Lock body scroll
  useEffect(() => {
    if (boss) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [boss]);

  if (!boss) return null;

  const tag          = TYPE_TAG[boss.type];
  const chapterLabel = `Chapter ${boss.chapter} · ${CHAPTER_ZH[boss.chapter]}`;

  function flash(which: 'death' | 'vanquish') {
    const setter = which === 'death' ? setDeathFlash : setVanqFlash;
    setter(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setter(true)));
  }

  function openFlow(which: ActiveFlow) {
    flash(which!);
    setNote('');
    setFightTime('');
    setActiveFlow(which);
  }

  function handleCommit(gif: GifData | null, noteArg: string, fightTimeMinutes?: number) {
    if (!boss) return;
    const noteVal = noteArg || undefined;
    const gifVal  = gif ?? undefined;
    if (activeFlow === 'death') {
      logAttempt(boss.id, { type: 'death', note: noteVal, gif: gifVal, fightTimeMinutes });
    } else if (activeFlow === 'vanquish') {
      markDefeated(boss.id, { note: noteVal, gif: gifVal, fightTimeMinutes });
    }
    setActiveFlow(null);
    setNote('');
    setFightTime('');
  }

  function handleNoteLog() {
    const mins = parseFloat(fightTime);
    handleCommit(null, note, mins > 0 ? mins : undefined);
  }

  function openNotesEdit() {
    setNotesDraft(progress?.notes ?? '');
    setNotesEditing(true);
  }

  function saveNotes() {
    if (!boss) return;
    setBossNotes(boss.id, notesDraft);
    setNotesEditing(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm"
      onClick={onClose}
      aria-label="Close modal"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-boss-name"
        className="relative bg-parchment rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col sm:flex-row border border-hairline"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-md text-ink-mute hover:bg-parchment-aged transition-colors font-sans text-title-sm"
        >
          ✕
        </button>

        {/* Left column — boss art */}
        <div className="sm:w-[44%] flex-shrink-0 bg-ink-soft relative">
          {boss.imageUrl ? (
            <img
              src={boss.imageUrl}
              alt={boss.name}
              data-boss-id={boss.id}
              className="w-full h-48 sm:h-full object-cover"
              style={{
                objectPosition: `${(boss.focalPoint?.x ?? 0.5) * 100}% ${(boss.focalPoint?.y ?? 0.5) * 100}%`,
              }}
            />
          ) : (
            <div className="w-full h-48 sm:h-full flex items-center justify-center text-parchment-text-mute font-zh text-zh">
              {boss.nameZh}
            </div>
          )}
          {/* Seal stamp overlay on defeated bosses */}
          {defeated && (
            <div className="absolute bottom-4 right-4 opacity-80">
              <SealStamp size={72} />
            </div>
          )}
        </div>

        {/* Right column — info */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6">
          <h2
            id="modal-boss-name"
            className="font-display text-display-md font-medium text-ink leading-tight"
          >
            {boss.name}
          </h2>

          <p className="font-zh text-zh text-ink-mute mt-1">{boss.nameZh}</p>

          <p className="font-sans text-body-sm text-ink-faded mt-3">
            {chapterLabel}
            <span className="mx-2 text-hairline">·</span>
            {boss.location}
          </p>

          {tag && (
            <span
              className={`mt-3 self-start font-sans text-caption-uc uppercase tracking-[1.2px] rounded-sm px-2 py-0.5 ${tag.className}`}
            >
              {tag.label}
            </span>
          )}

          {/* Difficulty rating */}
          <div className="mt-4 flex items-center gap-3">
            <span className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded">
              Difficulty
            </span>
            <InkStrokeRating
              value={(progress?.difficulty ?? 0) as Difficulty}
              onChange={(v) => setBossDifficulty(boss.id, v)}
            />
          </div>

          <div className="mt-4 border-t border-hairline" />

          {/* Death count + defeated status */}
          <div className="mt-5">
            <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded mb-1">
              Deaths
            </p>
            <p className="font-mono text-counter-lg font-bold text-ink leading-none">
              {deathCount}
            </p>
            {defeated && (
              <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-jade mt-2">
                Vanquished in {progress!.defeatedAtDeathCount} death
                {progress!.defeatedAtDeathCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3">

            {/* Flow panel — GIF picker (when enabled) or simple note field */}
            {activeFlow ? (
              gifPickerEnabled ? (
                <GifPicker
                  category={activeFlow === 'death' ? 'death' : 'kill'}
                  onCommit={handleCommit}
                  onCancel={() => { setActiveFlow(null); setNote(''); setFightTime(''); }}
                />
              ) : (
                <div className="flex flex-col gap-2 bg-canvas/30 rounded-md p-3 border border-hairline">
                  <div className="flex gap-2">
                    <input
                      ref={noteInputRef}
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleNoteLog(); }}
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
                      onClick={() => { setActiveFlow(null); setNote(''); }}
                      className="px-4 h-9 rounded-md font-sans text-btn text-ink-mute hover:bg-parchment-aged transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            ) : (
              <>
                {/* Death button */}
                <button
                  onClick={() => openFlow('death')}
                  disabled={defeated}
                  aria-label="Log a death"
                  onAnimationEnd={() => setDeathFlash(false)}
                  className={[
                    'h-12 w-full rounded-md border border-primary/40 bg-canvas',
                    'font-sans text-btn text-parchment-text tracking-[0.3px]',
                    'transition-colors hover:border-primary/70',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    deathFlash ? 'btn-death-flash' : '',
                  ].join(' ')}
                >
                  I have died once more
                </button>

                {/* Vanquished button */}
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
                    onClick={() => openFlow('vanquish')}
                    aria-label="Mark as vanquished"
                    onAnimationEnd={() => setVanqFlash(false)}
                    className={[
                      'h-12 w-full rounded-md bg-primary text-on-vermilion',
                      'font-sans text-btn tracking-[0.3px]',
                      'hover:bg-primary-active transition-colors',
                      vanqFlash ? 'btn-death-flash' : '',
                    ].join(' ')}
                  >
                    Vanquished
                  </button>
                )}
              </>
            )}
          </div>

            {/* Attempt timeline */}
            {(progress?.attempts?.length ?? 0) > 0 && (
              <>
                <div className="mt-5 border-t border-hairline" />
                <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded mt-4 mb-0">
                  History
                </p>
                <AttemptTimeline attempts={progress!.attempts} />
              </>
            )}

            {/* Strategy notes */}
            <div className="mt-5 border-t border-hairline" />
            <div className="mt-4 flex items-center justify-between mb-2">
              <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded">
                Strategy Notes
              </p>
              {!notesEditing && (
                <button
                  onClick={openNotesEdit}
                  aria-label="Edit strategy notes"
                  className="text-ink-faded hover:text-ink-mute transition-colors font-sans text-caption px-2 py-0.5 rounded hover:bg-parchment-aged"
                >
                  ✎ Edit
                </button>
              )}
            </div>

            {notesEditing ? (
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
                    onClick={saveNotes}
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
                className="cursor-pointer"
                onClick={openNotesEdit}
                role="button"
                aria-label="Edit strategy notes"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openNotesEdit(); }}
              >
                {renderMarkdown(progress.notes)}
              </div>
            ) : (
              <button
                onClick={openNotesEdit}
                className="w-full text-left font-sans text-body-sm text-ink-faded italic hover:text-ink-mute transition-colors py-1"
              >
                Add strategy notes…
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
