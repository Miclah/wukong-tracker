import { useState, useRef, useEffect, useCallback } from 'react';
import { CHAPTER_DATA } from '../data/chapters';
import { bosses } from '../data/bosses';
import { useTrackerStore } from '../store/useTrackerStore';
import { ChapterTabs } from '../components/ChapterTabs';
import { BossMapMarker } from '../components/BossMapMarker';
import { DevPanel } from '../components/DevPanel';
import type { Boss, Chapter } from '../types';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

// Activated via ?dev=1 in the URL. Never shown in production unless the user adds it.
const IS_DEV_MODE = new URLSearchParams(window.location.search).get('dev') === '1';

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

type Transform = { scale: number; x: number; y: number };

interface Props {
  onBossClick: (boss: Boss) => void;
}

export function MapView({ onBossClick }: Props) {
  const [chapter, setChapter] = useState<Chapter>(1);
  const [tf, setTf] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  // Dev tool state
  const [devSelectedBoss, setDevSelectedBoss] = useState<string | null>(null);
  const [devCoords, setDevCoords] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(bosses.map((b) => [b.id, { x: b.mapX, y: b.mapY }])),
  );
  const [devCrosshair, setDevCrosshair] = useState<{ x: number; y: number } | null>(null);
  const [exportDone, setExportDone] = useState(false);

  const progress = useTrackerStore((s) => s.progress);
  const chapterBosses = bosses.filter((b) => b.chapter === chapter);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

  const currentChapter = CHAPTER_DATA.find((c) => c.chapter === chapter)!;

  useEffect(() => {
    setTf({ scale: 1, x: 0, y: 0 });
    setImgError(false);
    setDevCrosshair(null);
    setDevSelectedBoss(null);
  }, [chapter]);

  const getClamped = useCallback((x: number, y: number, s: number): Transform => {
    const el = containerRef.current;
    if (!el) return { x, y, scale: s };
    const maxX = (el.offsetWidth * (s - 1)) / 2;
    const maxY = (el.offsetHeight * (s - 1)) / 2;
    return { scale: s, x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  }, []);

  // Non-passive wheel + touch listeners (passive: false required for preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setTf((prev) => {
        const newScale = clamp(prev.scale + delta, MIN_SCALE, MAX_SCALE);
        return getClamped(prev.x, prev.y, newScale);
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastPinchDist.current = null;
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        lastPinchDist.current = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && lastPinchDist.current === null) {
        const dx = e.touches[0].clientX - lastPointer.current.x;
        const dy = e.touches[0].clientY - lastPointer.current.y;
        lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setTf((prev) => getClamped(prev.x + dx, prev.y + dy, prev.scale));
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastPinchDist.current !== null) {
          const delta = (dist - lastPinchDist.current) * 0.01;
          setTf((prev) => {
            const newScale = clamp(prev.scale + delta, MIN_SCALE, MAX_SCALE);
            return getClamped(prev.x, prev.y, newScale);
          });
        }
        lastPinchDist.current = dist;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) lastPinchDist.current = null;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [getClamped]);

  const onMouseDown = (e: React.MouseEvent) => {
    // In dev placement mode, don't pan — let onClick handle coordinate recording
    if (IS_DEV_MODE && devSelectedBoss) return;
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setTf((prev) => getClamped(prev.x + dx, prev.y + dy, prev.scale));
  };

  const stopDrag = () => { isDragging.current = false; };

  // Invert the CSS transform to find where in the div (as %) the user clicked
  const onContainerClick = (e: React.MouseEvent) => {
    if (!IS_DEV_MODE || !devSelectedBoss) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const px = ((e.clientX - rect.left - W / 2 - tf.x) / tf.scale) + W / 2;
    const py = ((e.clientY - rect.top - H / 2 - tf.y) / tf.scale) + H / 2;
    const mapX = parseFloat(((px / W) * 100).toFixed(1));
    const mapY = parseFloat(((py / H) * 100).toFixed(1));
    setDevCoords((prev) => ({ ...prev, [devSelectedBoss]: { x: mapX, y: mapY } }));
    setDevCrosshair({ x: mapX, y: mapY });
    setExportDone(false);
  };

  const handleExport = () => {
    const placed = Object.fromEntries(
      bosses
        .filter((b) => devCoords[b.id]?.x !== 0 || devCoords[b.id]?.y !== 0)
        .map((b) => [b.id, { mapX: devCoords[b.id].x, mapY: devCoords[b.id].y }]),
    );
    navigator.clipboard.writeText(JSON.stringify(placed, null, 2)).then(() => {
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    });
  };

  const handleChapterChange = (c: Chapter | 0) => {
    if (c !== 0) setChapter(c);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 150px)' }}>
      {/* Dev mode instruction bar */}
      {IS_DEV_MODE && (
        <div className="bg-primary/10 border-b border-primary/30 px-4 py-1.5 shrink-0">
          <p className="font-mono text-[11px] text-primary">
            <span className="font-semibold">DEV MODE</span>
            {' '}· Select boss → click map to place → Export JSON → paste mapX/mapY into bosses.ts
          </p>
        </div>
      )}

      {/* Chapter selector */}
      <div className="bg-canvas-soft border-b border-hairline-dark shrink-0">
        <div className="max-w-[1280px] mx-auto px-4 py-3">
          <ChapterTabs active={chapter} onChange={handleChapterChange} showAll={false} />
        </div>
      </div>

      {/* Map viewport */}
      <div
        ref={containerRef}
        className={[
          'flex-1 relative overflow-hidden select-none',
          IS_DEV_MODE && devSelectedBoss ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing',
        ].join(' ')}
        style={{ touchAction: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onClick={onContainerClick}
      >
        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <span className="font-zh text-[64px] text-parchment-text-mute opacity-20">地圖</span>
            <p className="font-display text-[18px] font-medium text-parchment-text-mute tracking-[0.3px]">
              {currentChapter.en} — {currentChapter.location}
            </p>
            <p className="font-sans text-[13px] text-parchment-text-mute opacity-60">
              Add map image: public/maps/chapter-{chapter}.webp
            </p>
          </div>
        ) : (
          <div
            className="w-full h-full relative"
            style={{
              transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.scale})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={currentChapter.mapImageUrl}
              alt={`${currentChapter.en} — ${currentChapter.location}`}
              draggable={false}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />

            {chapterBosses.map((boss) => (
              <BossMapMarker
                key={boss.id}
                boss={boss}
                progress={IS_DEV_MODE ? undefined : progress[boss.id]}
                zoom={tf.scale}
                onClick={() => {
                  if (IS_DEV_MODE && devSelectedBoss) return;
                  onBossClick(boss);
                }}
              />
            ))}

            {/* Dev crosshair — shows last-clicked coordinate */}
            {IS_DEV_MODE && devCrosshair && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${devCrosshair.x}%`,
                  top: `${devCrosshair.y}%`,
                  transform: `translate(-50%, -50%) scale(${1 / tf.scale})`,
                  transformOrigin: 'center center',
                  zIndex: 20,
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <circle cx="20" cy="20" r="17" stroke="#c4453a" strokeWidth="1" opacity="0.5" />
                  <line x1="20" y1="2" x2="20" y2="38" stroke="#c4453a" strokeWidth="1.5" />
                  <line x1="2" y1="20" x2="38" y2="20" stroke="#c4453a" strokeWidth="1.5" />
                  <circle cx="20" cy="20" r="2.5" fill="#c4453a" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-canvas/80 backdrop-blur-sm border border-hairline-dark rounded-md px-3 py-1.5 pointer-events-none">
          <span className="font-mono text-[12px] text-parchment-text-mute">
            {Math.round(tf.scale * 100)}%
          </span>
        </div>

        {/* Dev panel */}
        {IS_DEV_MODE && (
          <DevPanel
            bosses={chapterBosses}
            devCoords={devCoords}
            selectedBossId={devSelectedBoss}
            onSelectBoss={setDevSelectedBoss}
            onExport={handleExport}
            exportDone={exportDone}
          />
        )}
      </div>
    </div>
  );
}
