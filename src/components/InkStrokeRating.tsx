import type { Difficulty } from '../types';

// Single ink-brush stroke SVG — hand-painted feel via irregular path
function InkStroke({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="inline-block"
    >
      {/* Brush stroke: a tapered diagonal slash */}
      <path
        d="M4 15 Q6 10 10 6 Q13 3 16 4 Q15 7 12 10 Q9 13 6 16 Q4.5 16.5 4 15Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.2}
        opacity={filled ? 1 : 0.3}
      />
    </svg>
  );
}

interface Props {
  value: Difficulty;
  onChange?: (value: Difficulty) => void;
  size?: number;
  readonly?: boolean;
}

export function InkStrokeRating({ value, onChange, size = 24, readonly = false }: Props) {
  const strokes = [1, 2, 3, 4, 5] as const;

  return (
    <div
      className="flex gap-1 items-center"
      role={readonly ? undefined : 'radiogroup'}
      aria-label="Difficulty rating"
    >
      {strokes.map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(value === n ? 0 : n)}
          aria-label={`${n} out of 5`}
          aria-pressed={value >= n}
          className={[
            'transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 rounded-sm',
            readonly ? 'cursor-default' : 'cursor-pointer hover:text-primary',
            value >= n ? 'text-primary' : 'text-ink-faded',
          ].join(' ')}
        >
          <InkStroke filled={value >= n} size={size} />
        </button>
      ))}
    </div>
  );
}
