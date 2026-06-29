import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attempt, BossProgress, Difficulty, FavoriteGif, GifData, TrackerActions, TrackerState } from '../types';
import { useSharedStore } from './useSharedStore';

function isReadOnly() {
  return useSharedStore.getState().isReadOnly;
}

const STORAGE_KEY = 'wukong-tracker-v1';

function initProgress(bossId: string): BossProgress {
  return {
    bossId,
    attempts: [],
    defeated: false,
    defeatedAtDeathCount: null,
  };
}

function getOrInit(
  progress: Record<string, BossProgress>,
  bossId: string,
): BossProgress {
  return progress[bossId] ?? initProgress(bossId);
}

function deathCount(p: BossProgress): number {
  return p.attempts.filter((a) => a.type === 'death').length;
}

type Store = TrackerState & TrackerActions;

export const useTrackerStore = create<Store>()(
  persist(
    (set) => ({
      progress: {},
      reactionsEnabled: true,
      unlockedAchievements: [],
      theme: 'dark',
      lastBackupAt: null,
      favoriteGifs: [],

      logAttempt(bossId, partial) {
        if (isReadOnly()) return;
        const attempt: Attempt = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...partial,
        };
        set((state) => {
          const prev = getOrInit(state.progress, bossId);
          return {
            progress: {
              ...state.progress,
              [bossId]: { ...prev, attempts: [attempt, ...prev.attempts] },
            },
          };
        });
      },

      markDefeated(bossId, options) {
        if (isReadOnly()) return;
        set((state) => {
          const prev = getOrInit(state.progress, bossId);
          const killAttempt: Attempt = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: 'kill',
            note: options?.note || undefined,
            gif: options?.gif,
            fightTimeMinutes: options?.fightTimeMinutes,
          };
          const updatedAttempts = [killAttempt, ...prev.attempts];
          return {
            progress: {
              ...state.progress,
              [bossId]: {
                ...prev,
                attempts: updatedAttempts,
                defeated: true,
                defeatedAtDeathCount: deathCount(prev),
              },
            },
          };
        });
      },

      resetBoss(bossId) {
        if (isReadOnly()) return;
        set((state) => ({
          progress: {
            ...state.progress,
            [bossId]: initProgress(bossId),
          },
        }));
      },

      setBossNotes(bossId, notes) {
        if (isReadOnly()) return;
        set((state) => {
          const prev = getOrInit(state.progress, bossId);
          return {
            progress: {
              ...state.progress,
              [bossId]: { ...prev, notes },
            },
          };
        });
      },

      setBossDifficulty(bossId, difficulty: Difficulty) {
        if (isReadOnly()) return;
        set((state) => {
          const prev = getOrInit(state.progress, bossId);
          return {
            progress: {
              ...state.progress,
              [bossId]: { ...prev, difficulty },
            },
          };
        });
      },

      setReactionsEnabled(enabled) {
        if (isReadOnly()) return;
        set({ reactionsEnabled: enabled });
      },

      unlockAchievement(achievementId) {
        if (isReadOnly()) return;
        set((state) => ({
          unlockedAchievements: state.unlockedAchievements.includes(achievementId)
            ? state.unlockedAchievements
            : [...state.unlockedAchievements, achievementId],
        }));
      },

      setTheme(theme) {
        if (isReadOnly()) return;
        set({ theme });
      },

      setLastBackupAt(ts) {
        if (isReadOnly()) return;
        set({ lastBackupAt: ts });
      },

      toggleFavoriteGif(gif: GifData) {
        if (isReadOnly()) return;
        set((state) => {
          const idx = state.favoriteGifs.findIndex((f: FavoriteGif) => f.url === gif.url);
          if (idx >= 0) {
            return { favoriteGifs: state.favoriteGifs.filter((_: FavoriteGif, i: number) => i !== idx) };
          }
          const entry: FavoriteGif = {
            url: gif.url,
            thumbnailUrl: gif.thumbnailUrl,
            description: gif.description,
            addedAt: Date.now(),
          };
          return { favoriteGifs: [...state.favoriteGifs, entry] };
        });
      },

      restoreFromBackup(progress, unlockedAchievements) {
        if (isReadOnly()) return;
        set({ progress, unlockedAchievements, lastBackupAt: Date.now() });
      },
    }),
    { name: STORAGE_KEY },
  ),
);
