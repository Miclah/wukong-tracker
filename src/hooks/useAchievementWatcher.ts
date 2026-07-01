import { useEffect, useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { bosses } from '../data/bosses';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';

export function useAchievementWatcher() {
  const progress             = useTrackerStore((s) => s.progress);
  const unlockedAchievements = useTrackerStore((s) => s.unlockedAchievements);
  const unlockAchievement    = useTrackerStore((s) => s.unlockAchievement);
  const favoriteGifs         = useTrackerStore((s) => s.favoriteGifs);

  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);

  useEffect(() => {
    const newlyUnlocked: Achievement[] = [];
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedAchievements.includes(achievement.id)) continue;
      if (achievement.check(progress, bosses, favoriteGifs)) {
        unlockAchievement(achievement.id);
        newlyUnlocked.push(achievement);
      }
    }
    if (newlyUnlocked.length > 0) {
      setToastQueue((q) => [...q, ...newlyUnlocked]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, favoriteGifs]);

  function dismissToast() {
    setToastQueue((q) => q.slice(1));
  }

  return { current: toastQueue[0] ?? null, dismissToast };
}
