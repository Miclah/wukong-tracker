export function MarkerUntouched() {
  return (
    <div style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* Outer ring — faint outline only */}
        <circle cx="16" cy="16" r="13" stroke="#a8987a" strokeWidth="1.5" opacity="0.45" />
        {/* Subtle dashed inner ring to suggest "unmapped" territory */}
        <circle
          cx="16"
          cy="16"
          r="9"
          stroke="#a8987a"
          strokeWidth="1"
          strokeDasharray="2.5 3"
          opacity="0.3"
        />
        {/* Faint center dot */}
        <circle cx="16" cy="16" r="2.5" fill="#a8987a" opacity="0.25" />
      </svg>
    </div>
  );
}
