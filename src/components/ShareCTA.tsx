import { useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { bosses } from '../data/bosses';
import { encodeShareState, buildShareUrl } from '../lib/share';

type CopyState = 'idle' | 'copied' | 'error';
type DownloadState = 'idle' | 'busy' | 'error';

type Props = {
  onDownload: () => Promise<void>;
};

export function ShareCTA({ onDownload }: Props) {
  const progress = useTrackerStore((s) => s.progress);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');

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

  async function handleDownload() {
    if (downloadState === 'busy') return;
    setDownloadState('busy');
    try {
      await onDownload();
      setDownloadState('idle');
    } catch {
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 2500);
    }
  }

  const copyLabel =
    copyState === 'copied'
      ? 'Link copied!'
      : copyState === 'error'
        ? 'Copy failed'
        : 'Copy share link';

  const downloadLabel =
    downloadState === 'busy'
      ? 'Generating…'
      : downloadState === 'error'
        ? 'Export failed'
        : 'Download stats card';

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

      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <button
          onClick={handleCopy}
          className={[
            'px-6 py-3 rounded-md font-sans text-[14px] font-semibold tracking-[0.3px] transition-colors focus:outline-none focus:ring-2 focus:ring-parchment/50',
            copyState === 'copied'
              ? 'bg-jade text-on-jade cursor-default'
              : copyState === 'error'
                ? 'bg-ink text-parchment-text-mute cursor-default'
                : 'bg-parchment text-ink hover:bg-parchment-aged',
          ].join(' ')}
          aria-label={copyLabel}
        >
          {copyLabel}
        </button>

        <button
          onClick={handleDownload}
          disabled={downloadState === 'busy'}
          className={[
            'px-6 py-3 rounded-md font-sans text-[14px] font-semibold tracking-[0.3px] transition-colors focus:outline-none focus:ring-2 focus:ring-parchment/50 border border-on-vermilion/30',
            downloadState === 'busy'
              ? 'bg-transparent text-on-vermilion/50 cursor-wait'
              : downloadState === 'error'
                ? 'bg-ink text-parchment-text-mute cursor-default'
                : 'bg-transparent text-on-vermilion hover:bg-on-vermilion/10',
          ].join(' ')}
          aria-label={downloadLabel}
        >
          {downloadLabel}
        </button>
      </div>
    </div>
  );
}
