import { create } from 'zustand';
import type { SharedSummary } from '../lib/share';

type SharedStore = {
  sharedSummary: SharedSummary | null;
  setSharedSummary: (summary: SharedSummary) => void;
  clearSharedSummary: () => void;
};

export const useSharedStore = create<SharedStore>()((set) => ({
  sharedSummary: null,
  setSharedSummary: (summary) => set({ sharedSummary: summary }),
  clearSharedSummary: () => set({ sharedSummary: null }),
}));
