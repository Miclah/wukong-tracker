import { create } from 'zustand';
import type { SharedSummary, SharePayload } from '../lib/share';

type SharedStore = {
  /** Legacy v1 summary — kept for SharedStatsView backward compat. */
  sharedSummary: SharedSummary | null;
  setSharedSummary: (summary: SharedSummary) => void;
  clearSharedSummary: () => void;

  /** Full v2 payload loaded from a shared URL. */
  sharedPayload: SharePayload | null;
  /** True whenever a valid ?s= param was decoded — all store mutations become no-ops. */
  isReadOnly: boolean;
  setSharedPayload: (payload: SharePayload) => void;
  clearSharedState: () => void;
};

export const useSharedStore = create<SharedStore>()((set) => ({
  sharedSummary: null,
  setSharedSummary: (summary) => set({ sharedSummary: summary }),
  clearSharedSummary: () => set({ sharedSummary: null }),

  sharedPayload: null,
  isReadOnly: false,
  setSharedPayload: (payload) => set({ sharedPayload: payload, isReadOnly: true }),
  clearSharedState: () => set({ sharedPayload: null, sharedSummary: null, isReadOnly: false }),
}));
