type Props = {
  value: number;  // 0–100 percentage
  label?: string; // e.g. "3 / 7 vanquished"
};

export function ProgressBar({ value, label }: Props) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-3">
      {/* Ghost outline track */}
      <div className="relative flex-1 h-2 border border-hairline/60 rounded-full overflow-hidden">
        {pct > 0 && (
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      {label && (
        <span className="font-mono text-[14px] font-semibold text-parchment-text-mute whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
