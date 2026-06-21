import { useEffect, useRef } from 'react';
import type { Boss } from '../types';
import { useTrackerStore } from '../store/useTrackerStore';

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

type TagStyle = {
  label: string;
  className: string;
};

const TYPE_TAG: Record<string, TagStyle> = {
  'yaoguai-king': {
    label: 'Yaoguai King',
    className: 'bg-primary/10 text-primary border border-primary/20',
  },
  'yaoguai-chief': {
    label: 'Yaoguai Chief',
    className: 'bg-gold/10 text-gold border border-gold/20',
  },
  'elite-yaoguai': {
    label: 'Elite Yaoguai',
    className: 'bg-parchment-aged text-ink-mute border border-hairline',
  },
  hidden: {
    label: 'Hidden',
    className: 'bg-parchment-aged text-ink-mute border border-dashed border-hairline',
  },
  final: {
    label: 'Final Boss',
    className: 'bg-primary/10 text-primary border border-primary/20',
  },
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function BossDetailModal({ boss, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const progress = useTrackerStore((s) => (boss ? s.progress[boss.id] : undefined));
  const deathCount = progress?.attempts.filter((a) => a.type === 'death').length ?? 0;

  // Esc to dismiss
  useEffect(() => {
    if (!boss) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [boss, onClose]);

  // Focus trap — run after content mounts
  useEffect(() => {
    if (!boss || !modalRef.current) return;
    const el = modalRef.current;
    const nodes = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    nodes[0]?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [boss]);

  // Prevent body scroll while open
  useEffect(() => {
    if (boss) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [boss]);

  if (!boss) return null;

  const tag = TYPE_TAG[boss.type];
  const chapterLabel = `Chapter ${boss.chapter} · ${CHAPTER_ZH[boss.chapter]}`;

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
        <div className="sm:w-[44%] flex-shrink-0 bg-ink-soft">
          {boss.imageUrl ? (
            <img
              src={boss.imageUrl}
              alt={boss.name}
              className="w-full h-48 sm:h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-48 sm:h-full flex items-center justify-center text-parchment-text-mute font-zh text-zh">
              {boss.nameZh}
            </div>
          )}
        </div>

        {/* Right column — info */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-0">
          {/* Boss name */}
          <h2
            id="modal-boss-name"
            className="font-display text-display-md font-medium text-ink leading-tight"
          >
            {boss.name}
          </h2>

          {/* Chinese subtitle */}
          <p className="font-zh text-zh text-ink-mute mt-1">{boss.nameZh}</p>

          {/* Chapter + location */}
          <p className="font-sans text-body-sm text-ink-faded mt-3">
            {chapterLabel}
            <span className="mx-2 text-hairline">·</span>
            {boss.location}
          </p>

          {/* Type tag */}
          {tag && (
            <span
              className={`mt-3 self-start font-sans text-caption-uc uppercase tracking-[1.2px] rounded-sm px-2 py-0.5 ${tag.className}`}
            >
              {tag.label}
            </span>
          )}

          {/* Divider */}
          <div className="mt-5 border-t border-hairline" />

          {/* Death count */}
          <div className="mt-5">
            <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-ink-faded mb-1">
              Deaths
            </p>
            <p className="font-mono text-counter-lg font-bold text-ink leading-none">
              {deathCount}
            </p>
            {progress?.defeated && (
              <p className="font-sans text-caption-uc uppercase tracking-[1.2px] text-jade mt-2">
                Vanquished in {progress.defeatedAtDeathCount} death
                {progress.defeatedAtDeathCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Buttons placeholder — wired in 2.3 / 2.4 */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="h-12 rounded-md border border-primary/40 bg-canvas flex items-center justify-center font-sans text-btn text-parchment-text-mute tracking-[0.3px] opacity-40 select-none">
              I have died once more
            </div>
            <div className="h-12 rounded-md bg-primary/40 flex items-center justify-center font-sans text-btn text-on-vermilion tracking-[0.3px] opacity-40 select-none">
              Vanquished
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
