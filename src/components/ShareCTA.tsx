import { useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { encodeState, buildShareUrl, buildGistUrl, SHARE_URL_LIMIT } from '../lib/share';
import { createGist } from '../lib/gist';

type CopyState = 'idle' | 'copied' | 'error';
type DownloadState = 'idle' | 'busy' | 'error';
type GistState = 'idle' | 'posting' | 'copied' | 'error';

type Props = {
  onDownload: () => Promise<void>;
};

export function ShareCTA({ onDownload }: Props) {
  const progress = useTrackerStore((s) => s.progress);
  const achievements = useTrackerStore((s) => s.unlockedAchievements);
  const favoriteGifs = useTrackerStore((s) => s.favoriteGifs);

  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [gistState, setGistState] = useState<GistState>('idle');
  const [gistId, setGistId] = useState<string | null>(null);
  // Cached encoded string reused for the Gist flow after direct-copy fails size check.
  const [oversizedEncoded, setOversizedEncoded] = useState<string | null>(null);

  async function handleCopy() {
    try {
      const encoded = encodeState({ progress, achievements, favoriteGifs });
      if (encoded.length > SHARE_URL_LIMIT) {
        setOversizedEncoded(encoded);
        setCopyState('error');
        return;
      }
      const url = buildShareUrl(encoded);
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }

  async function handleGistShare() {
    if (gistState === 'posting') return;
    setGistState('posting');
    try {
      const encoded = oversizedEncoded ?? encodeState({ progress, achievements, favoriteGifs });
      const id = await createGist(encoded);
      setGistId(id);
      const url = buildGistUrl(id);
      await navigator.clipboard.writeText(url);
      setGistState('copied');
    } catch {
      setGistState('error');
      setTimeout(() => setGistState('idle'), 3000);
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

  const isOversized = copyState === 'error' && oversizedEncoded !== null;

  const copyLabel =
    isOversized
      ? 'URL too large'
      : copyState === 'copied'
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

  const gistLabel =
    gistState === 'posting'
      ? 'Uploading…'
      : gistState === 'copied'
        ? 'Gist link copied!'
        : gistState === 'error'
          ? 'Upload failed'
          : 'Share via Gist (public)';

  return (
    <div className="bg-primary rounded-lg px-8 py-12 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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
              isOversized
                ? 'bg-ink text-parchment-text-mute cursor-default'
                : copyState === 'copied'
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

      {/* Gist fallback — shown when the direct URL would exceed browser limits */}
      {isOversized && (
        <div className="border-t border-on-vermilion/20 pt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="font-sans text-[13px] font-semibold text-on-vermilion">
              Your chronicle is too large for a URL.
            </p>
            <p className="font-sans text-[12px] text-on-vermilion/70">
              Share via a public GitHub Gist instead — no account needed.
              {gistId && (
                <span>
                  {' '}Your data is publicly available at{' '}
                  <a
                    href={`https://gist.github.com/${gistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-on-vermilion transition-colors"
                  >
                    gist.github.com/{gistId}
                  </a>
                  .
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleGistShare}
            disabled={gistState === 'posting'}
            className={[
              'shrink-0 px-5 py-2.5 rounded-md font-sans text-[13px] font-semibold tracking-[0.3px] transition-colors focus:outline-none focus:ring-2 focus:ring-parchment/50',
              gistState === 'copied'
                ? 'bg-jade text-on-jade cursor-default'
                : gistState === 'error'
                  ? 'bg-ink text-parchment-text-mute cursor-default'
                  : gistState === 'posting'
                    ? 'bg-parchment/50 text-ink/50 cursor-wait'
                    : 'bg-parchment text-ink hover:bg-parchment-aged',
            ].join(' ')}
            aria-label={gistLabel}
          >
            {gistLabel}
          </button>
        </div>
      )}
    </div>
  );
}
