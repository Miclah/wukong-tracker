interface Props {
  deathCount: number;
}

export function MarkerUndefeated({ deathCount }: Props) {
  return (
    <div className="relative flex flex-col items-center" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.75))' }}>
      <svg width="48" height="50" viewBox="0 0 48 50" fill="none" aria-hidden="true">
        {/* Ink splatter dots — brushwork feel, scattered asymmetrically */}
        <circle cx="5"  cy="13" r="1.2" fill="#c4453a" opacity="0.45" />
        <circle cx="44" cy="9"  r="0.9" fill="#c4453a" opacity="0.35" />
        <circle cx="2"  cy="28" r="0.8" fill="#c4453a" opacity="0.30" />
        <circle cx="46" cy="33" r="1.1" fill="#c4453a" opacity="0.40" />
        <circle cx="38" cy="4"  r="0.7" fill="#c4453a" opacity="0.28" />
        <circle cx="8"  cy="5"  r="1.0" fill="#c4453a" opacity="0.38" />
        <circle cx="43" cy="21" r="0.6" fill="#c4453a" opacity="0.22" />

        {/* Skull body — cranium + jaw as one shape, slightly asymmetric left/right */}
        <path
          d="
            M 24.5 4
            C 12 4 5 13 5 22.5
            C 5 31.5 10 38 18 41
            L 18 47
            L 21.5 47
            L 21.5 44
            L 24.5 44
            L 24.5 47
            L 28 47
            L 28 44
            L 31 44
            L 31 47
            L 34 47
            L 34 41
            C 41 38 43 31.5 43 22.5
            C 43 13 37 4 24.5 4
            Z
          "
          fill="#c4453a"
          stroke="#5c1a15"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />

        {/* Left eye socket — slightly larger (asymmetric hand-drawn feel) */}
        <ellipse cx="17" cy="21" rx="5.2" ry="6.2" fill="#5c1a15" />

        {/* Right eye socket — slightly smaller and shifted */}
        <ellipse cx="31.5" cy="21.5" rx="4.4" ry="5.5" fill="#5c1a15" />

        {/* Nose cavity */}
        <path d="M 22.5 30.5 L 24.5 34.5 L 26.5 30.5 Z" fill="#5c1a15" opacity="0.75" />
      </svg>

      {/* Death count badge — anchored below the skull */}
      {deathCount > 0 && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 min-w-[20px] h-[16px] px-1 flex items-center justify-center rounded bg-canvas border border-primary/60 font-mono text-[9px] font-bold text-primary leading-none"
          aria-hidden="true"
        >
          {deathCount > 99 ? '99+' : deathCount}
        </div>
      )}
    </div>
  );
}
