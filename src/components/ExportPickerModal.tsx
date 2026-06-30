import { useRef, useState, useEffect } from 'react';
import { StatsCardForExport } from './StatsCardForExport';
import { exportStatsPng } from '../lib/statsImage';
import type { BossProgress } from '../types';
import type { ExportVariant } from './StatsCardForExport';

type Props = {
  progress: Record<string, BossProgress>;
  unlockedAchievements: string[];
  onClose: () => void;
};

const VARIANTS: { id: ExportVariant; label: string; desc: string; accent: string }[] = [
  { id: 'suffering', label: 'Suffering',  desc: 'Deaths front and centre', accent: '#c4453a' },
  { id: 'chronicle', label: 'Chronicle',  desc: 'Balanced overview',        accent: '#c89b3c' },
  { id: 'triumph',   label: 'Triumph',    desc: 'Victories front and centre', accent: '#5a8a6e' },
];

const SCALE = 0.2;
const CARD_W = 1200;
const PREVIEW_H = 200;

// Inline-style palette for the modal UI (shown in the app, not exported)
const M = {
  parchment:     '#d9c89e',
  parchmentAged: '#c4b285',
  stained:       '#ad9c70',
  ink:           '#1f1812',
  inkMute:       '#6b5a44',
  inkFaded:      '#8a7558',
  primary:       '#c4453a',
  canvas:        'rgba(26, 20, 16, 0.88)',
};

export function ExportPickerModal({ progress, unlockedAchievements, onClose }: Props) {
  const [selected, setSelected] = useState<ExportVariant>('chronicle');
  const [exporting, setExporting] = useState(false);

  // Off-screen export-quality refs (no CSS transform parent → html2canvas renders full size)
  const sufferingRef = useRef<HTMLDivElement>(null);
  const chronicleRef = useRef<HTMLDivElement>(null);
  const triumphRef   = useRef<HTMLDivElement>(null);

  const exportRefs: Record<ExportVariant, React.RefObject<HTMLDivElement | null>> = {
    suffering: sufferingRef,
    chronicle: chronicleRef,
    triumph:   triumphRef,
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleDownload() {
    const el = exportRefs[selected].current;
    if (!el || exporting) return;
    setExporting(true);
    try {
      await exportStatsPng(el);
    } finally {
      setExporting(false);
      onClose();
    }
  }

  return (
    <>
      {/* Off-screen export cards — no transform parent, so html2canvas reads full 1200px width */}
      <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: '-99999px', pointerEvents: 'none' }}>
        <StatsCardForExport ref={sufferingRef} variant="suffering" progress={progress} unlockedAchievements={unlockedAchievements} />
        <StatsCardForExport ref={chronicleRef} variant="chronicle" progress={progress} unlockedAchievements={unlockedAchievements} />
        <StatsCardForExport ref={triumphRef}   variant="triumph"   progress={progress} unlockedAchievements={unlockedAchievements} />
      </div>

      {/* Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose export card layout"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: M.canvas,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Modal panel */}
        <div style={{
          position: 'relative',
          backgroundColor: M.parchment,
          borderRadius: '8px',
          padding: '48px',
          maxWidth: '940px',
          width: 'calc(100% - 48px)',
        }}>
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '22px',
              lineHeight: 1,
              color: M.inkMute,
              padding: '4px 8px',
            }}
          >
            ×
          </button>

          <h2 style={{
            fontFamily: 'Cinzel, "Cormorant SC", serif',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '2px',
            color: M.ink,
            margin: 0,
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}>
            Choose Your Card
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: M.inkFaded,
            margin: 0,
            marginBottom: '32px',
          }}>
            Pick a layout, then download as PNG.
          </p>

          {/* Three variant columns */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {VARIANTS.map((v) => {
              const isSelected = selected === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  style={{
                    background: 'none',
                    border: `2px solid ${isSelected ? v.accent : M.stained}`,
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                    outline: isSelected ? `3px solid ${v.accent}` : 'none',
                    outlineOffset: '2px',
                    transition: 'border-color 0.15s, outline 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {/* Scaled live preview — display only, export uses the off-screen refs */}
                  <div style={{
                    width: CARD_W * SCALE,
                    height: PREVIEW_H,
                    overflow: 'hidden',
                    borderRadius: '3px',
                    pointerEvents: 'none',
                    backgroundColor: '#d9c89e',
                  }}>
                    <div style={{
                      transform: `scale(${SCALE})`,
                      transformOrigin: 'top left',
                      width: `${CARD_W}px`,
                    }}>
                      {/* Separate instance from the export ref — no ref needed here */}
                      <StatsCardForExport
                        variant={v.id}
                        progress={progress}
                        unlockedAchievements={unlockedAchievements}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <p style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isSelected ? v.accent : M.ink,
                      margin: 0,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}>
                      {v.label}
                    </p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      color: M.inkFaded,
                      margin: 0,
                      marginTop: '3px',
                    }}>
                      {v.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: 'none',
                border: `1px solid ${M.stained}`,
                borderRadius: '6px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: M.inkMute,
                cursor: 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={exporting}
              style={{
                padding: '10px 24px',
                backgroundColor: M.primary,
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f5e9d4',
                cursor: exporting ? 'wait' : 'pointer',
                letterSpacing: '0.5px',
                opacity: exporting ? 0.65 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {exporting ? 'Exporting…' : 'Download PNG'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
