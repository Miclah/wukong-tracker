import { useState, useEffect, useRef } from 'react';
import type { GifData } from '../types';
import { searchGifs, nextDeathQuery, nextKillQuery, pickRandom } from '../lib/giphy';
import { getFallbackGifs } from '../lib/gifFallback';

interface Props {
  category: 'death' | 'kill';
  onCommit: (gif: GifData | null, note: string, fightTimeMinutes?: number) => void;
  onCancel: () => void;
}

export default function GifPicker({ category, onCommit, onCancel }: Props) {
  const initialQuery = useRef(
    category === 'death' ? nextDeathQuery() : nextKillQuery()
  );
  const [query, setQuery]         = useState(initialQuery.current);
  const [gifs, setGifs]           = useState<GifData[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<GifData | null>(null);
  const [note, setNote]           = useState('');
  const [fightTime, setFightTime] = useState('');
  const noteRef                    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    noteRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelected(null);

    searchGifs(query)
      .then((results) => {
        if (cancelled) return;
        setGifs(results.length ? results : getFallbackGifs(category));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGifs(getFallbackGifs(category));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query, category]);

  function parsedTime(): number | undefined {
    const v = parseFloat(fightTime);
    return v > 0 ? v : undefined;
  }

  function handleAttach() {
    if (selected) onCommit(selected, note.trim(), parsedTime());
  }

  function handleSurprise() {
    const pick = pickRandom(gifs);
    onCommit(pick, note.trim(), parsedTime());
  }

  function handleSkip() {
    onCommit(null, note.trim(), parsedTime());
  }

  function handleNoteKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) handleSkip();
    if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
  }

  return (
    <div className="flex flex-col gap-2 bg-canvas/40 rounded-md border border-hairline p-3">

      {/* Search bar */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search GIFs…"
        aria-label="Search GIFs"
        className="w-full rounded-md bg-canvas border border-hairline-dark px-3 py-1.5 font-sans text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60"
      />

      {/* Thumbnail grid */}
      <div
        className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto rounded"
        aria-label="GIF results"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-canvas-soft rounded animate-pulse"
              />
            ))
          : gifs.map((gif, i) => (
              <button
                key={`${gif.thumbnailUrl}-${i}`}
                onClick={() => setSelected(gif === selected ? null : gif)}
                aria-label={gif.description}
                aria-pressed={gif === selected}
                className={[
                  'rounded overflow-hidden border-2 transition-colors focus:outline-none',
                  gif === selected ? 'border-primary' : 'border-transparent hover:border-primary/40',
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

      {/* Note + fight time row */}
      <div className="flex gap-2">
        <input
          ref={noteRef}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleNoteKey}
          placeholder="What happened… (optional)"
          aria-label="Attempt note"
          className="flex-1 rounded-md bg-canvas border border-hairline-dark px-3 py-1.5 font-sans text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60"
        />
        <input
          type="number"
          min="0"
          step="0.5"
          value={fightTime}
          onChange={(e) => setFightTime(e.target.value)}
          placeholder="min"
          aria-label="Fight duration in minutes"
          className="w-16 rounded-md bg-canvas border border-hairline-dark px-2 py-1.5 font-mono text-body-sm text-parchment-text placeholder-ink-faded focus:outline-none focus:border-primary/60 text-center"
        />
      </div>

      {/* Action row */}
      <div className="flex gap-2">
        <button
          onClick={handleAttach}
          disabled={!selected}
          className="flex-1 h-9 rounded-md bg-primary text-on-vermilion font-sans text-btn tracking-[0.3px] hover:bg-primary-active transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Attach GIF
        </button>
        <button
          onClick={handleSurprise}
          className="px-3 h-9 rounded-md border border-hairline font-sans text-btn text-parchment-text-mute hover:bg-canvas-soft transition-colors"
        >
          Surprise me
        </button>
        <button
          onClick={handleSkip}
          className="px-3 h-9 rounded-md font-sans text-btn text-ink-mute hover:bg-parchment-aged transition-colors"
        >
          Skip
        </button>
      </div>

      {/* GIPHY attribution — required by GIPHY terms */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="font-sans text-caption text-ink-faded hover:text-ink-mute transition-colors"
        >
          Cancel
        </button>
        <span className="font-sans text-caption text-ink-faded">
          Powered by GIPHY
        </span>
      </div>
    </div>
  );
}
