import { useState } from 'react';
import { BossDetailModal } from './components/BossDetailModal';
import { useTrackerStore } from './store/useTrackerStore';
import type { Boss } from './types';

// Temporary stub boss used to preview the modal until Phase 1 boss data is wired in.
const STUB_BOSS: Boss = {
  id: 'black-bear-guai',
  name: 'Black Bear Guai',
  nameZh: '黑熊精',
  chapter: 1,
  location: 'Black Wind Mountain',
  type: 'yaoguai-king',
  imageUrl: '',
  mapX: 0,
  mapY: 0,
  fandomUrl: '',
};

export default function App() {
  const [open, setOpen] = useState(false);
  const gifPickerEnabled    = useTrackerStore((s) => s.reactionsEnabled);
  const setGifPickerEnabled = useTrackerStore((s) => s.setReactionsEnabled);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-hairline-dark">
        <h1 className="font-display text-display-sm font-medium text-parchment-text tracking-wide">
          受難
        </h1>

        {/* GIF picker toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="font-sans text-body-sm text-parchment-text-mute">GIF picker</span>
          <button
            role="switch"
            aria-checked={gifPickerEnabled}
            onClick={() => setGifPickerEnabled(!gifPickerEnabled)}
            className={[
              'relative w-10 h-5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
              gifPickerEnabled
                ? 'bg-primary border-primary'
                : 'bg-canvas-soft border-hairline',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
                gifPickerEnabled
                  ? 'translate-x-5 bg-on-vermilion'
                  : 'translate-x-0.5 bg-ink-faded',
              ].join(' ')}
            />
          </button>
        </label>
      </header>

      {/* Page body */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        <p className="font-display text-display-sm font-medium text-parchment-text-mute tracking-widest uppercase">
          The Suffering
        </p>

        {/* Temporary preview button — removed once BossCard is wired */}
        <button
          onClick={() => setOpen(true)}
          className="mt-4 px-5 py-2 rounded-md bg-primary text-on-vermilion font-sans text-btn tracking-[0.3px] hover:bg-primary-active transition-colors"
        >
          Preview Modal
        </button>
      </main>

      <BossDetailModal boss={open ? STUB_BOSS : null} onClose={() => setOpen(false)} />
    </div>
  );
}
