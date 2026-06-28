import { useEffect, useState } from 'react'

function isFocalDevMode() {
  return new URLSearchParams(window.location.search).get('dev') === 'focal'
}

function getBossImage(target: EventTarget | null): HTMLImageElement | null {
  if (!(target instanceof Element)) return null
  const img = target.closest('img[data-boss-id]')
  return img instanceof HTMLImageElement ? img : null
}

function calcFocalPoint(e: MouseEvent, img: HTMLImageElement) {
  const rect = img.getBoundingClientRect()
  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100) / 100
  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100) / 100
  return { x, y }
}

export function FocalPointPicker() {
  const [active] = useState(() => isFocalDevMode())
  const [hover, setHover] = useState<{ bossId: string; x: number; y: number } | null>(null)

  useEffect(() => {
    if (!active) return

    function onMouseMove(e: MouseEvent) {
      const img = getBossImage(e.target)
      if (!img) { setHover(null); return }
      const { x, y } = calcFocalPoint(e, img)
      setHover({ bossId: img.dataset.bossId!, x, y })
    }

    function onClick(e: MouseEvent) {
      const img = getBossImage(e.target)
      if (!img) return
      const { x, y } = calcFocalPoint(e, img)
      const result = { bossId: img.dataset.bossId, focalPoint: { x, y } }
      console.log(JSON.stringify(result, null, 2))
      navigator.clipboard?.writeText(JSON.stringify(result)).catch(() => {})
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('click', onClick)
    }
  }, [active])

  if (!active) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#9e3329',
          color: '#f5e9d4',
          fontFamily: 'monospace',
          fontSize: 11,
          padding: '4px 12px',
          textAlign: 'center',
          pointerEvents: 'none',
          letterSpacing: '0.05em',
        }}
      >
        DEV: FOCAL POINT PICKER — hover over a boss image and click to log focalPoint JSON to console
        {hover && (
          <span style={{ marginLeft: 16, opacity: 0.85 }}>
            [{hover.bossId}] x:{hover.x} y:{hover.y}
          </span>
        )}
      </div>
      <style>{`img[data-boss-id] { cursor: crosshair !important; }`}</style>
    </>
  )
}
