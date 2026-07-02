import { useEffect } from 'react'

interface Props {
  onLanded: () => void
}

// Skull SVG that drops onto the death counter, rotates, and lands with a
// subtle thud. The counter number is bumped by the caller once this lands.
export function DeathStampDrop({ onLanded }: Props) {
  useEffect(() => {
    const t = setTimeout(onLanded, 450)
    return () => clearTimeout(t)
  }, [onLanded])

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
      className="death-skull-drop absolute -top-8 left-0"
    >
      <circle cx="15" cy="12" r="8" fill="#c4453a" opacity="0.9" />
      <rect x="9.5" y="17.5" width="4" height="4.5" rx="1" fill="#c4453a" opacity="0.75" />
      <rect x="16.5" y="17.5" width="4" height="4.5" rx="1" fill="#c4453a" opacity="0.75" />
      <circle cx="12" cy="11.5" r="1.6" fill="#211812" />
      <circle cx="18" cy="11.5" r="1.6" fill="#211812" />
    </svg>
  )
}
