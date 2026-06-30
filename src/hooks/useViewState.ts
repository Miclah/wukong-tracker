import { useSharedStore } from '../store/useSharedStore';
import { useTrackerStore } from '../store/useTrackerStore';
import type { BossProgress, FavoriteGif } from '../types';

/** Returns progress from shared payload when in read-only mode, else own tracker progress. */
export function useViewProgress(): Record<string, BossProgress> {
  const isReadOnly    = useSharedStore((s) => s.isReadOnly);
  const sharedPayload = useSharedStore((s) => s.sharedPayload);
  const ownProgress   = useTrackerStore((s) => s.progress);
  return isReadOnly && sharedPayload ? sharedPayload.progress : ownProgress;
}

/** Returns achievements from shared payload when in read-only mode, else own achievements. */
export function useViewAchievements(): string[] {
  const isReadOnly    = useSharedStore((s) => s.isReadOnly);
  const sharedPayload = useSharedStore((s) => s.sharedPayload);
  const own           = useTrackerStore((s) => s.unlockedAchievements);
  return isReadOnly && sharedPayload ? sharedPayload.achievements : own;
}

/** Returns favoriteGifs from shared payload when in read-only mode, else own favorites. */
export function useViewFavoriteGifs(): FavoriteGif[] {
  const isReadOnly    = useSharedStore((s) => s.isReadOnly);
  const sharedPayload = useSharedStore((s) => s.sharedPayload);
  const own           = useTrackerStore((s) => s.favoriteGifs);
  return isReadOnly && sharedPayload ? sharedPayload.favoriteGifs : own;
}
