import { useSharedStore } from '../store/useSharedStore';

export function ReadOnlyBanner() {
  const clearSharedState = useSharedStore((s) => s.clearSharedState);

  const encoded = new URLSearchParams(window.location.search).get('s') ?? '';
  const pilgrimId = encoded.slice(0, 3).toUpperCase();

  function handleBackToOwn() {
    clearSharedState();
    const url = window.location.pathname + window.location.hash;
    window.location.href = url;
  }

  return (
    <div
      role="status"
      className="w-full bg-parchment-aged border-b border-parchment-stained z-40 sticky top-0"
      style={{ zIndex: 50 }}
    >
      <div className="max-w-[1280px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <p className="font-sans text-[12px] text-ink leading-snug">
          <span className="font-semibold">{pilgrimId}</span>
          {'‘s pilgrimage'}
          <span className="mx-2 text-ink-mute">·</span>
          <span className="tracking-[0.5px] uppercase text-[10px] font-semibold text-primary">
            Read only
          </span>
        </p>
        <button
          onClick={handleBackToOwn}
          className="font-sans text-[12px] font-semibold text-ink hover:text-primary transition-colors underline underline-offset-2 shrink-0"
        >
          Back to my own
        </button>
      </div>
    </div>
  );
}
