type Props = {
  size?: number;
  className?: string;
};

export function SealStamp({ size = 60, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`-rotate-3 ${className}`}
      style={{ display: 'block' }}
    >
      {/* Stamp border — double-ruled like a traditional Chinese chop */}
      <rect x="2"  y="2"  width="56" height="56" rx="1" fill="#c4453a" />
      <rect x="5"  y="5"  width="50" height="50" rx="0.5" fill="none" stroke="#f5e9d4" strokeWidth="1" opacity="0.5" />

      {/* Four character glyphs carved in negative space (parchment colour on vermilion) */}
      {/* Top-left: 降 (vanquish) */}
      <g fill="#f5e9d4" opacity="0.92">
        {/* Top-left glyph — simplified 降 strokes */}
        <rect x="9"  y="10" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="13" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="16" width="6"  height="1.5" rx="0.5" />
        <rect x="13" y="10" width="1.5" height="9"  rx="0.5" />

        {/* Top-right glyph — simplified 魔 strokes */}
        <rect x="33" y="10" width="10" height="1.5" rx="0.5" />
        <rect x="33" y="13" width="10" height="1.5" rx="0.5" />
        <rect x="33" y="16" width="10" height="1.5" rx="0.5" />
        <rect x="37" y="10" width="1.5" height="9"  rx="0.5" />
        <rect x="40" y="13" width="1.5" height="6"  rx="0.5" />

        {/* Bottom-left glyph — simplified 齊 strokes */}
        <rect x="9"  y="33" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="36" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="39" width="10" height="1.5" rx="0.5" />
        <rect x="11" y="33" width="1.5" height="9"  rx="0.5" />
        <rect x="16" y="33" width="1.5" height="9"  rx="0.5" />

        {/* Bottom-right glyph — simplified 天 strokes */}
        <rect x="33" y="34" width="10" height="1.5" rx="0.5" />
        <rect x="36" y="33" width="1.5" height="10" rx="0.5" />
        <rect x="33" y="38" width="4"  height="1.5" rx="0.5" />
        <rect x="40" y="38" width="4"  height="1.5" rx="0.5" transform="rotate(20 40 38)" />
      </g>

      {/* Central dividing cross — faint ink line separating the four quadrants */}
      <line x1="30" y1="8"  x2="30" y2="52" stroke="#f5e9d4" strokeWidth="0.5" opacity="0.25" />
      <line x1="8"  y1="30" x2="52" y2="30" stroke="#f5e9d4" strokeWidth="0.5" opacity="0.25" />

      {/* Outer worn-edge effect — subtle inset shadow via inner rect at low opacity */}
      <rect x="2" y="2" width="56" height="56" rx="1"
        fill="none" stroke="#6b1f1a" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}
