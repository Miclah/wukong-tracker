import { SUTRA_CHARACTERS } from '../../data/sutra';

const ALL_CHARS = SUTRA_CHARACTERS.flatMap((s) => [...s]);

// Deterministic pseudo-random so columns are stable across renders
function pr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface ColumnConfig {
  x: number;
  chars: string[];
  fontSize: number;
  opacity: number;
  duration: number;
  delay: number;
}

const COLUMNS: ColumnConfig[] = Array.from({ length: 4 }, (_, i) => ({
  x: Math.floor(pr(i * 7) * 55),
  chars: Array.from({ length: 20 }, (_, j) => ALL_CHARS[(i * 20 + j) % ALL_CHARS.length]),
  fontSize: 18 + Math.floor(pr(i * 3 + 1) * 7),
  opacity: 0.06 + pr(i * 5 + 2) * 0.04,
  duration: 10 + pr(i * 11 + 3) * 15,
  delay: -(pr(i * 13 + 4) * 25),
}));

export function CalligraphyRain() {
  return (
    <div
      className="calligraphy-rain"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      {COLUMNS.map((col, i) => (
        <div
          key={i}
          className="calligraphy-column"
          style={{
            left: col.x,
            fontSize: col.fontSize,
            color: `rgba(232, 217, 176, ${col.opacity.toFixed(3)})`,
            animationDuration: `${col.duration.toFixed(1)}s`,
            animationDelay: `${col.delay.toFixed(1)}s`,
          }}
        >
          {col.chars.map((ch, j) => (
            <span key={j}>{ch}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
