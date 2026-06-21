import { useState } from 'react';
import { BossDetailModal } from './components/BossDetailModal';
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="font-display text-display-xl font-medium text-parchment-text tracking-wide">
        受難
      </h1>
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

      <BossDetailModal boss={open ? STUB_BOSS : null} onClose={() => setOpen(false)} />
    </main>
  );
}
