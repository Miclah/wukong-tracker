import { useEffect } from 'react';
import { decodeShareState } from '../lib/share';
import { useSharedStore } from '../store/useSharedStore';

/**
 * On mount, reads the `?s=` URL param. If valid, decodes the shared summary
 * and stores it in useSharedStore. Never touches the user's localStorage data.
 */
export function useSharedStateLoad(): void {
  const setSharedSummary = useSharedStore((s) => s.setSharedSummary);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (!encoded) return;

    const summary = decodeShareState(encoded);
    if (summary) {
      setSharedSummary(summary);
    }
  }, [setSharedSummary]);
}
