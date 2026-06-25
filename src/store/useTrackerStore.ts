import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attempt, BossProgress, Difficulty, TrackerActions, TrackerState } from '../types';

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

      logAttempt(bossId, partial) {
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
        set((state) => ({
          progress: {
            ...state.progress,
            [bossId]: initProgress(bossId),
          },
        }));
      },

      setBossNotes(bossId, notes) {
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
        set({ reactionsEnabled: enabled });
      },

      unlockAchievement(achievementId) {
        set((state) => ({
          unlockedAchievements: state.unlockedAchievements.includes(achievementId)
            ? state.unlockedAchievements
            : [...state.unlockedAchievements, achievementId],
        }));
      },

      setTheme(theme) {
        set({ theme });
      },

      setLastBackupAt(ts) {
        set({ lastBackupAt: ts });
      },

      restoreFromBackup(progress, unlockedAchievements) {
        set({ progress, unlockedAchievements, lastBackupAt: Date.now() });
      },
    }),
    { name: STORAGE_KEY },
  ),
);
