import { useEffect } from 'react';
import { decodeState, decodeShareState } from '../lib/share';
import { fetchGist } from '../lib/gist';
import { useSharedStore } from '../store/useSharedStore';

/**
 * On mount, reads share params from the URL:
 * - `?s=<encoded>` — inline lz-string payload (v2 full or v1 summary)
 * - `?gist=<id>` — large payload stored in a public GitHub Gist
 *
 * v2 payload sets isReadOnly=true and loads full data into sharedPayload.
 * v1 payload loads into sharedSummary for the legacy SharedStatsView.
 * Never touches the user's own localStorage data.
 */
export function useSharedStateLoad(): void {
  const setSharedPayload = useSharedStore((s) => s.setSharedPayload);
  const setSharedSummary = useSharedStore((s) => s.setSharedSummary);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    async function tryLoad() {
      let encoded: string | null = params.get('s');

      if (!encoded) {
        const gistId = params.get('gist');
        if (!gistId) return;
        encoded = await fetchGist(gistId);
        if (!encoded) return;
      }

      const v2 = decodeState(encoded);
      if (v2) {
        setSharedPayload(v2);
        return;
      }

      const v1 = decodeShareState(encoded);
      if (v1) {
        setSharedSummary(v1);
      }
    }

    void tryLoad();
  }, [setSharedPayload, setSharedSummary]);
}
