import { useState, useEffect, useMemo } from 'react';
import { SUTRA_CHARACTERS } from '../../data/sutra';

const ALL_CHARS = SUTRA_CHARACTERS.flatMap((s) => [...s]);

function pr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function makeColumns(count: number, seedOffset: number, stripWidth: number) {
  return Array.from({ length: count }, (_, i) => {
    const s = seedOffset + i;
    const slot = count === 1 ? 0.5 : i / (count - 1);
    // Spread from 20px near screen edge to 25px from inner boss-card edge
    const maxX = Math.max(20, stripWidth - 30);
    const baseX = 20 + slot * (maxX - 20);
    return {
      x: Math.round(baseX + (pr(s * 7) - 0.5) * 8),
      chars: Array.from({ length: 32 }, (_, j) => ALL_CHARS[(s * 32 + j) % ALL_CHARS.length]),
      fontSize: 19 + Math.floor(pr(s * 3 + 1) * 5),
      opacity: 0.18 + pr(s * 5 + 2) * 0.14,
      duration: 28 + pr(s * 11 + 3) * 24, // 28–52s
      delay: -(pr(s * 13 + 4) * 32),
    };
  });
}

function RainSide({ side, stripWidth }: { side: 'left' | 'right'; stripWidth: number }) {
  const seedOffset = side === 'left' ? 0 : 50;
  // ~1 column per 80px of available margin, capped at 8
  const count = Math.max(2, Math.min(8, Math.floor(stripWidth / 80)));
  const columns = useMemo(
    () => makeColumns(count, seedOffset, stripWidth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, seedOffset, stripWidth],
  );

  if (stripWidth < 60) return null;

  return (
    <div
      className={`calligraphy-rain calligraphy-rain--${side}`}
      style={{ width: stripWidth }}
      aria-hidden="true"
    >
      {columns.map((col, i) => (
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

export function CalligraphyRain() {
  const [stripWidth, setStripWidth] = useState(() =>
    Math.max(0, (window.innerWidth - 1280) / 2 - 20),
  );

  useEffect(() => {
    const update = () => setStripWidth(Math.max(0, (window.innerWidth - 1280) / 2 - 20));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <>
      <RainSide side="left"  stripWidth={stripWidth} />
      <RainSide side="right" stripWidth={stripWidth} />
    </>
  );
}
