import type { Boss, BossProgress, Attempt } from '../types';

type Progress = Record<string, BossProgress>;
type Chapter = 1 | 2 | 3 | 4 | 5 | 6;

export type ChapterProgress = {
  chapter: Chapter;
  defeated: number;
  total: number;
};

export type BossStat = {
  boss: Boss;
  deaths: number;
};

function deathsFor(bp: BossProgress): number {
  return bp.attempts.filter((a: Attempt) => a.type === 'death').length;
}

export function totalDeaths(progress: Progress): number {
  return Object.values(progress).reduce((sum, bp) => sum + deathsFor(bp), 0);
}

export function totalKills(progress: Progress): number {
  return Object.values(progress).filter((bp) => bp.defeated).length;
}

export function hardestBoss(progress: Progress, bosses: Boss[]): BossStat | null {
  let best: BossStat | null = null;
  for (const boss of bosses) {
    const bp = progress[boss.id];
    if (!bp || bp.attempts.length === 0) continue;
    const deaths = deathsFor(bp);
    if (best === null || deaths > best.deaths) {
      best = { boss, deaths };
    }
  }
  return best;
}

export function cleanestKill(progress: Progress, bosses: Boss[]): BossStat | null {
  let best: BossStat | null = null;
  for (const boss of bosses) {
    const bp = progress[boss.id];
    if (!bp || !bp.defeated) continue;
    // defeatedAtDeathCount is the death count at the moment of kill — use it if available
    const deaths = bp.defeatedAtDeathCount ?? deathsFor(bp);
    if (best === null || deaths < best.deaths) {
      best = { boss, deaths };
    }
  }
  return best;
}

export function chapterProgress(progress: Progress, bosses: Boss[]): ChapterProgress[] {
  const chapters: Chapter[] = [1, 2, 3, 4, 5, 6];
  return chapters.map((chapter) => {
    const chapterBosses = bosses.filter((b) => b.chapter === chapter);
    const defeated = chapterBosses.filter((b) => progress[b.id]?.defeated).length;
    return { chapter, defeated, total: chapterBosses.length };
  });
}

export function avgDeathsPerBoss(progress: Progress, bosses: Boss[]): number {
  const attempted = bosses.filter(
    (b) => progress[b.id] && progress[b.id].attempts.length > 0,
  );
  if (attempted.length === 0) return 0;
  const total = attempted.reduce((sum, b) => sum + deathsFor(progress[b.id]), 0);
  return Math.round((total / attempted.length) * 10) / 10;
}
