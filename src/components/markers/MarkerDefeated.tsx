export function MarkerDefeated() {
  return (
    <div style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.75))' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        {/* Outer seal body — square with rounded corners, jade green */}
        <rect x="3" y="3" width="42" height="42" rx="5" ry="5" fill="#5a8a6e" />

        {/* Aged texture overlay — faded patches for hand-stamped feel */}
        <rect x="3"  y="3"  width="12" height="12" rx="5" fill="#3d6650" opacity="0.35" />
        <rect x="33" y="33" width="12" height="12" rx="5" fill="#3d6650" opacity="0.28" />
        <circle cx="38" cy="10" r="4"  fill="#3d6650" opacity="0.2" />
        <circle cx="10" cy="38" r="3"  fill="#3d6650" opacity="0.18" />

        {/* Inner carved border */}
        <rect
          x="7" y="7" width="34" height="34"
          rx="3" ry="3"
          fill="none"
          stroke="rgba(240,234,216,0.28)"
          strokeWidth="1.5"
        />

        {/* 勝 (victory) in seal-script style, carved white */}
        <text
          x="24"
          y="33"
          textAnchor="middle"
          fill="rgba(240,234,216,0.88)"
          fontFamily="'Noto Serif SC', serif"
          fontSize="23"
          fontWeight="700"
        >
          勝
        </text>

        {/* Subtle ink bleed dots at corners — real stamp imperfection */}
        <circle cx="5.5"  cy="5.5"  r="1.8" fill="#3d6650" opacity="0.5" />
        <circle cx="42.5" cy="5.5"  r="1.5" fill="#3d6650" opacity="0.4" />
        <circle cx="5.5"  cy="42.5" r="1.4" fill="#3d6650" opacity="0.38" />
        <circle cx="42.5" cy="42.5" r="1.6" fill="#3d6650" opacity="0.45" />
      </svg>
    </div>
  );
}
