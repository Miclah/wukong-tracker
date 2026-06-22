type Props = {
  value: number;  // 0–100 percentage
  label?: string; // e.g. "3 / 7 vanquished"
};

export function ProgressBar({ value, label }: Props) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-1.5 bg-canvas-soft rounded-full overflow-hidden">
        <div
          className="h-full bg-jade rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && (
        <span className="font-mono text-[14px] font-semibold text-parchment-text-mute whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
