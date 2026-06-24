import { useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { bosses } from '../data/bosses';
import { encodeShareState, buildShareUrl } from '../lib/share';

type CopyState = 'idle' | 'copied' | 'error';

export function ShareCTA() {
  const progress = useTrackerStore((s) => s.progress);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  async function handleCopy() {
    try {
      const encoded = encodeShareState(progress, bosses);
      const url = buildShareUrl(encoded);
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }

  const buttonLabel =
    copyState === 'copied'
      ? 'Link copied!'
      : copyState === 'error'
        ? 'Copy failed'
        : 'Copy share link';

  return (
    <div className="bg-primary rounded-lg px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="space-y-1 text-center sm:text-left">
        <h3 className="font-display text-[22px] font-medium tracking-[0.3px] text-on-vermilion">
          Show them your suffering
        </h3>
        <p className="font-sans text-[14px] text-on-vermilion/75">
          Share your stats as a link — no account, no server, just pain encoded in a URL.
        </p>
      </div>

      <button
        onClick={handleCopy}
        className={[
          'shrink-0 px-6 py-3 rounded-md font-sans text-[14px] font-semibold tracking-[0.3px] transition-colors focus:outline-none focus:ring-2 focus:ring-parchment/50',
          copyState === 'copied'
            ? 'bg-jade text-on-jade cursor-default'
            : copyState === 'error'
              ? 'bg-ink text-parchment-text-mute cursor-default'
              : 'bg-parchment text-ink hover:bg-parchment-aged',
        ].join(' ')}
        aria-label={buttonLabel}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
