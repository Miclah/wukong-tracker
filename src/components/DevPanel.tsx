import type { Boss } from '../types';

interface DevCoord { x: number; y: number }

interface Props {
  bosses: Boss[];
  devCoords: Record<string, DevCoord>;
  selectedBossId: string | null;
  onSelectBoss: (id: string) => void;
  onExport: () => void;
  exportDone: boolean;
}

export function DevPanel({ bosses, devCoords, selectedBossId, onSelectBoss, onExport, exportDone }: Props) {
  const placedCount = bosses.filter(
    (b) => devCoords[b.id]?.x !== 0 || devCoords[b.id]?.y !== 0,
  ).length;

  return (
    <div
      className="absolute top-4 right-4 z-50 w-72 bg-canvas border border-hairline rounded-lg shadow-xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-canvas-soft px-4 py-2.5 border-b border-hairline-dark">
        <p className="font-mono text-[11px] text-parchment-text-mute tracking-widest uppercase">
          Dev · Coordinate Picker
        </p>
        <p className="font-mono text-[10px] text-ink-faded mt-0.5">
          {placedCount} / {bosses.length} placed this chapter
        </p>
      </div>

      {/* Boss selector */}
      <div className="px-4 py-3 border-b border-hairline-dark">
        <label htmlFor="dev-boss-select" className="block font-sans text-[11px] text-parchment-text-mute uppercase tracking-[1px] mb-1.5">
          Active boss
        </label>
        <div className="relative">
          <select
            id="dev-boss-select"
            value={selectedBossId ?? ''}
            onChange={(e) => onSelectBoss(e.target.value)}
            className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 font-sans text-[13px] text-parchment-text appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— select a boss —</option>
            {bosses.map((b) => {
              const placed = devCoords[b.id]?.x !== 0 || devCoords[b.id]?.y !== 0;
              return (
                <option key={b.id} value={b.id}>
                  {placed ? '✓ ' : '○ '}{b.name}
                </option>
              );
            })}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faded text-[10px]">▼</span>
        </div>
        <p className="mt-1.5 font-sans text-[11px] text-ink-faded">
          {selectedBossId
            ? <>Click the map to place <span className="text-primary">{bosses.find((b) => b.id === selectedBossId)?.name}</span></>
            : 'Select a boss, then click its location on the map'}
        </p>
      </div>

      {/* Placements list */}
      <div className="max-h-52 overflow-y-auto">
        {bosses.map((b) => {
          const coord = devCoords[b.id];
          const placed = coord?.x !== 0 || coord?.y !== 0;
          const isSelected = b.id === selectedBossId;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBoss(b.id)}
              className={[
                'w-full flex items-center justify-between px-4 py-1.5 text-left border-b border-hairline-dark/40 last:border-0 transition-colors',
                isSelected ? 'bg-primary/10' : 'hover:bg-canvas-soft',
              ].join(' ')}
            >
              <span className={`font-sans text-[12px] ${placed ? 'text-parchment-text' : 'text-ink-faded'}`}>
                {placed ? '✓' : '○'}&nbsp;{b.name}
              </span>
              {placed && (
                <span className="font-mono text-[10px] text-ink-faded shrink-0 ml-2 tabular-nums">
                  {coord.x.toFixed(1)},{coord.y.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Export */}
      <div className="px-4 py-3 border-t border-hairline-dark">
        <button
          type="button"
          onClick={onExport}
          className="w-full py-2 rounded-md bg-primary/10 border border-primary/30 font-sans text-[13px] font-semibold text-primary hover:bg-primary/20 active:bg-primary/30 transition-colors"
        >
          {exportDone ? '✓ Copied to clipboard!' : 'Export JSON to clipboard'}
        </button>
      </div>
    </div>
  );
}
