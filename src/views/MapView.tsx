import { useState, useRef, useEffect, useCallback } from 'react';
import { CHAPTER_DATA } from '../data/chapters';
import { ChapterTabs } from '../components/ChapterTabs';
import type { Chapter } from '../types';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

type Transform = { scale: number; x: number; y: number };

export function MapView() {
  const [chapter, setChapter] = useState<Chapter>(1);
  const [tf, setTf] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

  const currentChapter = CHAPTER_DATA.find((c) => c.chapter === chapter)!;

  useEffect(() => {
    setTf({ scale: 1, x: 0, y: 0 });
    setImgError(false);
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

  const handleChapterChange = (c: Chapter | 0) => {
    if (c !== 0) setChapter(c);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 89px)' }}>
      {/* Chapter selector */}
      <div className="bg-canvas-soft border-b border-hairline-dark shrink-0">
        <div className="max-w-[1280px] mx-auto px-4 py-3">
          <ChapterTabs active={chapter} onChange={handleChapterChange} showAll={false} />
        </div>
      </div>

      {/* Map viewport */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-canvas cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
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
            className="w-full h-full"
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
          </div>
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-canvas/80 backdrop-blur-sm border border-hairline-dark rounded-md px-3 py-1.5 pointer-events-none">
          <span className="font-mono text-[12px] text-parchment-text-mute">
            {Math.round(tf.scale * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
