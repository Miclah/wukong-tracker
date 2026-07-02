// Brush-stroke SVG accents: tab underline and section divider.

/** Animates left-to-right under active tab (resets on each mount via brush-stroke-in class). */
export function BrushStrokeUnderline() {
  return (
    <svg
      width="100%"
      height="5"
      viewBox="0 0 100 5"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="brush-stroke-in"
    >
      {/* Main wavy stroke — tapered at both ends */}
      <path
        d="M 0 2.5 Q 18 1 40 2.8 Q 62 4.2 80 2.5 Q 90 1.5 100 2.5"
        stroke="#c4453a"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Bristle streak */}
      <path
        d="M 3 2 Q 45 3.5 85 2 Q 92 1.8 98 2.5"
        stroke="#c4453a"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

/** Vermillion underline that draws left-to-right on hover of an ancestor `.group`. */
export function BrushStrokeHoverUnderline() {
  return (
    <svg
      width="100%"
      height="4"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="brush-underline-hover"
    >
      <path
        d="M 0 2 Q 18 0.8 40 2.2 Q 62 3.4 80 2 Q 90 1.2 100 2"
        stroke="#c4453a"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Horizontal brush-stroke section divider (replaces plain border-t hr). */
export function BrushStrokeDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <svg width="100%" height="6" viewBox="0 0 400 6" preserveAspectRatio="none">
        <path
          d="M 0 3 Q 100 1.5 200 3.2 Q 300 4.5 400 3"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          className="text-hairline-dark"
          opacity="0.55"
        />
        <path
          d="M 8 3.2 Q 130 2 260 3.1 Q 330 3.8 392 3"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          className="text-hairline-dark"
          opacity="0.22"
        />
      </svg>
    </div>
  );
}
