import { useState } from 'react';
import type { Difficulty } from '../types';

// CSS filter that tints black ink to vermillion (#c4453a)
const VERMILLION_FILTER =
  'brightness(0) saturate(100%) invert(29%) sepia(60%) saturate(900%) hue-rotate(328deg) brightness(95%)';

interface Props {
  value: Difficulty;
  onChange?: (value: Difficulty) => void;
  size?: number;
  readonly?: boolean;
}

export function DifficultyRating({ value, onChange, size = 36, readonly = false }: Props) {
  const [hoverLevel, setHoverLevel] = useState<number>(0);

  const strokes = [1, 2, 3, 4, 5] as const;
  const displayLevel = hoverLevel > 0 ? hoverLevel : value;

  return (
    <div
      className="flex gap-2 items-center"
      role={readonly ? undefined : 'radiogroup'}
      aria-label="Difficulty rating"
      onMouseLeave={() => setHoverLevel(0)}
    >
      {strokes.map((n) => {
        const filled = displayLevel >= n;
        const isInteractive = !readonly;

        return (
          <button
            key={n}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(value === n ? ((n - 1) as Difficulty) : n)}
            onMouseEnter={() => isInteractive && setHoverLevel(n)}
            aria-label={`Set difficulty to ${n} out of 5`}
            aria-pressed={value >= n}
            className={[
              'transition-opacity duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 rounded-sm p-0',
              readonly ? 'cursor-default' : 'cursor-pointer',
            ].join(' ')}
            style={{ background: 'none', border: 'none' }}
          >
            <img
              src={`/brush/stroke-${n}.png`}
              alt=""
              aria-hidden="true"
              width={size}
              height={size}
              style={{
                width: size,
                height: size,
                objectFit: 'contain',
                filter: filled
                  ? VERMILLION_FILTER
                  : 'grayscale(1) brightness(0.6)',
                opacity: filled ? 1 : 0.25,
                transition: 'filter 150ms, opacity 150ms',
                pointerEvents: 'none',
                display: 'block',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
