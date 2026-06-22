type Props = {
  title: string;
  value: string | number;
  sub?: string;
};

export function StatsCard({ title, value, sub }: Props) {
  return (
    <div className="bg-surface-dark-card border border-hairline-dark rounded-lg p-6 flex flex-col gap-2">
      <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-parchment-text leading-snug">
        {title}
      </h3>
      <span className="font-mono text-[48px] font-bold leading-none text-gold">
        {value}
      </span>
      {sub && (
        <p className="font-sans text-[13px] text-parchment-text-mute leading-snug">
          {sub}
        </p>
      )}
    </div>
  );
}
