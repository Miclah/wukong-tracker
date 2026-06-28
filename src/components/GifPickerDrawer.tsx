import { useState, useEffect, useRef } from 'react';
import { useGifDrawerStore } from '../store/useGifDrawerStore';
import type { GifData } from '../types';
import { searchGifs, nextDeathQuery, nextKillQuery, pickRandom } from '../lib/giphy';
import { getFallbackGifs } from '../lib/gifFallback';

// ── Inner content — re-mounts fresh each time drawer opens ───────────────────
function DrawerInner({
  type,
  onCommit,
  onClose,
}: {
  type: 'death' | 'kill';
  onCommit: (gif: GifData | null, note: string, fightTimeMinutes?: number) => void;
  onClose: () => void;
}) {
  const initialQuery          = useRef(type === 'death' ? nextDeathQuery() : nextKillQuery());
  const [query, setQuery]     = useState(initialQuery.current);
  const [gifs, setGifs]       = useState<GifData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GifData | null>(null);
  const [note, setNote]         = useState('');
  const [fightTime, setFightTime] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);

  // Focus search input after slide-in settles
  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // Focus trap within drawer
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const nodes = el!.querySelectorAll<HTMLElement>(
        'button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])'
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last  = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    el.addEventListener('keydown', handleTab);
    return () => el.removeEventListener('keydown', handleTab);
  }, []);

  // Fetch GIFs whenever query changes
  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    setLoading(true);
    setSelected(null);
    searchGifs(query)
      .then((results) => {
        if (cancelled) return;
        setGifs(results.length ? results : getFallbackGifs(type));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGifs(getFallbackGifs(type));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query, type]);

  function parsedTime(): number | undefined {
    const v = parseFloat(fightTime);
    return v > 0 ? v : undefined;
  }

  function commit(gif: GifData | null) {
    onCommit(gif, note.trim(), parsedTime());
  }

  const title         = type === 'death' ? 'Summon Your Sorrow' : 'Summon Your Triumph';
  const categoryLabel = type === 'death' ? '受難 · Death' : '受勝 · Victory';

  return (
    <div ref={innerRef} className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-hairline flex-shrink-0">
        <div>
          <p className="font-sans text-[10px] tracking-[1.2px] uppercase text-ink-faded">
            {categoryLabel}
          </p>
          <h2 className="font-display text-[1.1rem] text-parchment-text mt-0.5">
            {title}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close GIF picker"
          className="w-8 h-8 flex items-center justify-center rounded text-parchment-text-mute hover:text-parchment-text hover:bg-hairline/20 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

        {/* Search */}
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs…"
          aria-label="Search GIFs"
          className="w-full rounded-md bg-canvas border border-hairline-dark px-3 py-2 font-sans text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60"
        />

        {/* Grid — 2-col, bigger thumbnails than the old inline picker */}
        <div className="grid grid-cols-2 gap-2" aria-label="GIF results">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video bg-canvas rounded animate-pulse" />
              ))
            : gifs.map((gif, i) => (
                <button
                  key={`${gif.thumbnailUrl}-${i}`}
                  onClick={() => setSelected(gif === selected ? null : gif)}
                  aria-label={gif.description}
                  aria-pressed={gif === selected}
                  className={[
                    'relative rounded overflow-hidden border-2 transition-colors focus:outline-none aspect-video',
                    gif === selected
                      ? 'border-primary'
                      : 'border-transparent hover:border-primary/40',
                  ].join(' ')}
                >
                  <img
                    src={gif.thumbnailUrl}
                    alt={gif.description}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
        </div>

        {/* Note + fight time */}
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened… (optional)"
            aria-label="Attempt note"
            className="flex-1 rounded-md bg-canvas border border-hairline-dark px-3 py-2 font-sans text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60"
          />
          <input
            type="number"
            min="0"
            step="0.5"
            value={fightTime}
            onChange={(e) => setFightTime(e.target.value)}
            placeholder="min"
            aria-label="Fight duration in minutes"
            className="w-16 rounded-md bg-canvas border border-hairline-dark px-2 py-2 font-mono text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60 text-center"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => commit(selected)}
            disabled={!selected}
            className="flex-1 h-10 rounded-md bg-primary text-on-vermilion font-sans text-btn tracking-[0.3px] hover:bg-primary-active transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Attach GIF
          </button>
          <button
            onClick={() => commit(pickRandom(gifs))}
            className="px-4 h-10 rounded-md border border-hairline font-sans text-btn text-parchment-text-mute hover:bg-canvas transition-colors"
          >
            Surprise me
          </button>
          <button
            onClick={() => commit(null)}
            className="px-4 h-10 rounded-md font-sans text-btn text-ink-mute hover:bg-canvas-soft transition-colors"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-hairline flex-shrink-0">
        <p className="font-sans text-[10px] text-parchment-text-mute opacity-50 text-right">
          Powered by GIPHY
        </p>
      </div>
    </div>
  );
}

// ── Drawer shell — always in DOM so exit transition is visible ────────────────
export default function GifPickerDrawer() {
  const { isOpen, context, closeDrawer } = useGifDrawerStore();

  // Body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Esc to close (handled at window level so it catches all key sources)
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeDrawer]);

  return (
    <>
      {/* Dimming backdrop */}
      <div
        aria-hidden="true"
        onClick={isOpen ? closeDrawer : undefined}
        className="fixed inset-0 z-40 bg-canvas/60 transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="GIF picker"
        aria-hidden={!isOpen}
        className="fixed inset-y-0 right-0 z-50 w-full lg:w-[480px] bg-canvas-soft border-l border-hairline-dark"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 350ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {isOpen && context && (
          <DrawerInner
            type={context.type}
            onCommit={(gif, note, fightTimeMinutes) => {
              context.onCommit(gif, note, fightTimeMinutes);
              closeDrawer();
            }}
            onClose={closeDrawer}
          />
        )}
      </div>
    </>
  );
}
