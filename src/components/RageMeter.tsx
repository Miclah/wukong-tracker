type Props = {
  rage: number;      // 0–unlimited, visualised on a 1-10+ scale
  bossName?: string;
};

// Returns how many of the 10 flame segments are lit
function litSegments(rage: number): number {
  return Math.min(10, rage);
}

// Colour shifts from amber → vermilion as rage climbs
function flameColour(index: number, total: number): string {
  if (total <= 3) return '#c89b3c';   // gold — mild annoyance
  if (total <= 6) return '#c4453a';   // vermilion — genuine rage
  return '#9e3329';                    // primary-active — pure suffering
}

export function RageMeter({ rage, bossName }: Props) {
  const lit = litSegments(rage);
  const isMaxed = rage >= 10;

  return (
    <div className="bg-surface-dark-card border border-hairline-dark rounded-lg p-6 flex flex-col gap-4">
      <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text">
        Rage Meter
      </h3>

      {/* flame segments */}
      <div className="flex items-end gap-1">
        {Array.from({ length: 10 }, (_, i) => {
          const active = i < lit;
          const height = 12 + i * 4; // grows taller toward right: 12–48px
          return (
            <div
              key={i}
              className="rounded-sm flex-1 transition-all duration-300"
              style={{
                height: `${height}px`,
                backgroundColor: active ? flameColour(i, lit) : 'var(--color-canvas)',
                opacity: active ? 1 : 0.25,
                boxShadow: active && isMaxed
                  ? `0 0 8px ${flameColour(i, lit)}88`
                  : undefined,
              }}
            />
          );
        })}
      </div>

      {/* labels */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[48px] font-bold leading-none text-primary">
          {rage}
        </span>
        <div className="text-right">
          <p className="font-sans text-[13px] font-semibold text-parchment-text-mute uppercase tracking-widest">
            consecutive deaths
          </p>
          {bossName && (
            <p className="font-sans text-[13px] text-parchment-text-mute mt-0.5">
              {bossName}
            </p>
          )}
        </div>
      </div>

      {isMaxed && (
        <p className="font-display text-[13px] text-primary tracking-wide animate-pulse">
          Maximum suffering achieved.
        </p>
      )}
    </div>
  );
}
