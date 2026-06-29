import { useEffect } from 'react';
import { decodeState, decodeShareState } from '../lib/share';
import { useSharedStore } from '../store/useSharedStore';

/**
 * On mount, reads the `?s=` URL param. If present:
 * - v2 payload (full state) → stored in sharedPayload, isReadOnly set to true.
 * - v1 payload (summary only) → stored in sharedSummary for legacy SharedStatsView.
 * Never touches the user's localStorage data.
 */
export function useSharedStateLoad(): void {
  const setSharedPayload = useSharedStore((s) => s.setSharedPayload);
  const setSharedSummary = useSharedStore((s) => s.setSharedSummary);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (!encoded) return;

    const v2 = decodeState(encoded);
    if (v2) {
      setSharedPayload(v2);
      return;
    }

    const v1 = decodeShareState(encoded);
    if (v1) {
      setSharedSummary(v1);
    }
  }, [setSharedPayload, setSharedSummary]);
}
