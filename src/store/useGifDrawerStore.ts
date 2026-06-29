import { create } from 'zustand';
import type { GifData } from '../types';

export type GifDrawerContext = {
  type: 'death' | 'kill';
  onCommit: (gif: GifData | null, note: string, fightTimeMinutes?: number) => void;
};

type GifDrawerState = {
  isOpen: boolean;
  context: GifDrawerContext | null;
  openDrawer: (ctx: GifDrawerContext) => void;
  closeDrawer: () => void;
};

export const useGifDrawerStore = create<GifDrawerState>()((set) => ({
  isOpen: false,
  context: null,
  openDrawer: (ctx) => set({ isOpen: true, context: ctx }),
  closeDrawer: () => set({ isOpen: false, context: null }),
}));
