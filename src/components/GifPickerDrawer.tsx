import { useState, useEffect, useRef } from 'react';
import { useGifDrawerStore } from '../store/useGifDrawerStore';
import { useTrackerStore } from '../store/useTrackerStore';
import type { GifData } from '../types';
import { searchGifs, randomQuery, pickRandom, PAGE_SIZE } from '../lib/giphy';
import { getFallbackGifs } from '../lib/gifFallback';

const SEARCH_PLACEHOLDER: Record<'death' | 'kill', string> = {
  death: 'type to summon your sorrow...',
  kill:  'type to summon your triumph...',
};

// Module-level: persists across drawer open/close within the same browser session
let sessionSearchHistory: string[] = [];

// ── Single GIF cell with ★ favorite overlay ───────────────────────────────────
function GifCell({
  gif,
  isSelected,
  isFavorited,
  onSelect,
  onToggleFavorite,
}: {
  gif: GifData;
  isSelected: boolean;
  isFavorited: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      aria-label={gif.description}
      aria-pressed={isSelected}
      className={[
        'relative rounded overflow-hidden border-2 transition-colors cursor-pointer group aspect-video',
        isSelected ? 'border-primary' : 'border-transparent hover:border-primary/40',
      ].join(' ')}
    >
      <img
        src={gif.thumbnailUrl}
        alt={gif.description}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      {/* Star button — invisible until hover, pointer-events-none so overlay doesn't block clicks */}
      <div className="absolute inset-0 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className={[
            'absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[13px] transition-all',
            'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto',
            isFavorited
              ? 'bg-gold/90 text-ink'
              : 'bg-canvas/80 text-parchment-text-mute hover:text-gold hover:bg-canvas',
          ].join(' ')}
        >
          {isFavorited ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}

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
  const favoriteGifs     = useTrackerStore((s) => s.favoriteGifs);
  const toggleFavoriteGif = useTrackerStore((s) => s.toggleFavoriteGif);

  const [activeTab, setActiveTab]   = useState<'search' | 'favorites'>('search');
  const [query, setQuery]           = useState('');
  const [gifs, setGifs]             = useState<GifData[]>([]);
  const [loading, setLoading]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasMore, setHasMore]       = useState(false);
  const [offset, setOffset]         = useState(0);
  const [selected, setSelected]     = useState<GifData | null>(null);
  const [note, setNote]             = useState('');
  const [fightTime, setFightTime]   = useState('');
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(sessionSearchHistory);
  const currentQuery = useRef('');

  const searchRef = useRef<HTMLInputElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);

  // Focus search input after slide-in settles
  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // Re-focus search when switching to search tab
  useEffect(() => {
    if (activeTab === 'search') {
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [activeTab]);

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

  // Debounced search — fires 400ms after the user stops typing
  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => {
      // Record in session history (deduplicated, last 3)
      const trimmed = query.trim();
      const updated = [trimmed, ...sessionSearchHistory.filter((s) => s !== trimmed)].slice(0, 3);
      sessionSearchHistory = updated;
      setRecentSearches(updated);

      currentQuery.current = trimmed;
      setHasSearched(true);
      setLoading(true);
      setSelected(null);
      setOffset(0);
      setHasMore(false);
      let cancelled = false;
      searchGifs(trimmed, PAGE_SIZE, 0)
        .then((results) => {
          if (cancelled) return;
          const pool = results.length ? results : getFallbackGifs(type);
          setGifs(pool);
          setHasMore(results.length === PAGE_SIZE);
          setLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setGifs(getFallbackGifs(type));
          setHasMore(false);
          setLoading(false);
        });
      return () => { cancelled = true; };
    }, 400);
    return () => clearTimeout(t);
  }, [query, type]);

  async function loadMore() {
    const nextOffset = offset + PAGE_SIZE;
    setLoadingMore(true);
    try {
      const results = await searchGifs(currentQuery.current, PAGE_SIZE, nextOffset);
      if (results.length) {
        setGifs((prev) => [...prev, ...results]);
        setOffset(nextOffset);
        setHasMore(results.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }
    setLoadingMore(false);
  }

  function parsedTime(): number | undefined {
    const v = parseFloat(fightTime);
    return v > 0 ? v : undefined;
  }

  function commit(gif: GifData | null) {
    onCommit(gif, note.trim(), parsedTime());
  }

  async function handleSurprise() {
    setSurpriseLoading(true);
    const q = randomQuery(type);
    try {
      const results = await searchGifs(q);
      const pool = results.length ? results : getFallbackGifs(type);
      commit(pickRandom(pool));
    } catch {
      commit(pickRandom(getFallbackGifs(type)));
    }
  }

  const isFavorited = (gif: GifData) => favoriteGifs.some((f) => f.url === gif.url);

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

      {/* Tab nav */}
      <div className="flex border-b border-hairline flex-shrink-0" role="tablist">
        {(['search', 'favorites'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'flex-1 py-2.5 font-sans text-[12px] font-semibold tracking-[1px] uppercase transition-colors border-b-2',
              activeTab === tab
                ? 'border-primary text-parchment-text'
                : 'border-transparent text-parchment-text-mute hover:text-parchment-text',
            ].join(' ')}
          >
            {tab === 'favorites'
              ? `Favorites${favoriteGifs.length > 0 ? ` (${favoriteGifs.length})` : ''}`
              : 'Search'}
          </button>
        ))}
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

        {/* ── Search tab ── */}
        {activeTab === 'search' && (
          <>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={SEARCH_PLACEHOLDER[type]}
              aria-label="Search GIFs"
              className="w-full rounded-md bg-canvas border border-hairline-dark px-3 py-2 font-sans text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60"
            />

            {/* Recent search chips */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap gap-1.5" aria-label="Recent searches">
                {recentSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="px-2.5 py-0.5 rounded-full border border-hairline font-sans text-[11px] text-parchment-text-mute hover:border-primary/40 hover:text-parchment-text transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {hasSearched ? (
              <>
                <div className="grid grid-cols-2 gap-2" aria-label="GIF results">
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-video bg-canvas rounded animate-pulse" />
                      ))
                    : gifs.map((gif, i) => (
                        <GifCell
                          key={`${gif.thumbnailUrl}-${i}`}
                          gif={gif}
                          isSelected={gif === selected}
                          isFavorited={isFavorited(gif)}
                          onSelect={() => setSelected(gif === selected ? null : gif)}
                          onToggleFavorite={() => toggleFavoriteGif(gif)}
                        />
                      ))}
                </div>

                {/* Load more */}
                {!loading && hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full py-2 font-sans text-[12px] text-parchment-text-mute hover:text-parchment-text border border-hairline rounded-md hover:border-primary/40 transition-colors disabled:opacity-40"
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </>
            ) : (
              <p className="font-display-alt italic text-parchment-text-mute text-[0.85rem] text-center py-6 opacity-60">
                {type === 'death'
                  ? 'Search above, or let fate decide.'
                  : 'Search above, or let victory choose itself.'}
              </p>
            )}
          </>
        )}

        {/* ── Favorites tab ── */}
        {activeTab === 'favorites' && (
          favoriteGifs.length > 0 ? (
            <div className="grid grid-cols-2 gap-2" aria-label="Favorite GIFs">
              {favoriteGifs.map((fav, i) => (
                <GifCell
                  key={`${fav.url}-${i}`}
                  gif={fav}
                  isSelected={fav.url === selected?.url}
                  isFavorited={true}
                  onSelect={() => setSelected(fav.url === selected?.url ? null : fav)}
                  onToggleFavorite={() => toggleFavoriteGif(fav)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <span className="text-[2rem] text-parchment-text-mute opacity-30">☆</span>
              <p className="font-display-alt italic text-parchment-text-mute text-[0.85rem] opacity-60">
                No favorites yet. Hover any GIF and tap ★ to save it here.
              </p>
            </div>
          )
        )}
      </div>

      {/* Pinned bottom: note + actions — always visible, never scrolls away */}
      <div className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-hairline flex flex-col gap-3">
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
        <div className="flex gap-2">
          {selected && (
            <button
              onClick={() => commit(selected)}
              className="flex-1 h-10 rounded-md bg-primary text-on-vermilion font-sans text-btn tracking-[0.3px] hover:bg-primary-active transition-colors"
            >
              Attach GIF
            </button>
          )}
          <button
            onClick={handleSurprise}
            disabled={surpriseLoading}
            className="flex-1 h-10 rounded-md border border-hairline font-sans text-btn text-parchment-text-mute hover:bg-canvas transition-colors disabled:opacity-50"
          >
            {surpriseLoading ? '…' : 'Surprise me'}
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
      <div className="px-5 py-2 border-t border-hairline flex-shrink-0">
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
