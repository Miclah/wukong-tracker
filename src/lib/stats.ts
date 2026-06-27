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

/** Total fight time in minutes summed across all logged attempts. */
export function totalFightTime(progress: Progress): number {
  return Object.values(progress).reduce((sum, bp) => {
    return sum + bp.attempts.reduce((s, a) => s + (a.fightTimeMinutes ?? 0), 0);
  }, 0);
}

export function avgDeathsPerBoss(progress: Progress, bosses: Boss[]): number {
  const attempted = bosses.filter(
    (b) => progress[b.id] && progress[b.id].attempts.length > 0,
  );
  if (attempted.length === 0) return 0;
  const total = attempted.reduce((sum, b) => sum + deathsFor(progress[b.id]), 0);
  return Math.round((total / attempted.length) * 10) / 10;
}

/** Bosses sorted by difficulty rating (highest first), rated bosses only. */
export function hardestRatedBosses(
  progress: Progress,
  bosses: Boss[],
): Array<{ boss: Boss; difficulty: number }> {
  return bosses
    .filter((b) => (progress[b.id]?.difficulty ?? 0) > 0)
    .map((b) => ({ boss: b, difficulty: progress[b.id].difficulty! }))
    .sort((a, b) => b.difficulty - a.difficulty);
}

// ── Streaks & Rage ────────────────────────────────────────────────────────────

export type StreakResult = { boss: Boss; streak: number } | null;
export type RageResult = { boss: Boss; rage: number } | null;

const TEN_MINUTES = 10 * 60 * 1000;

/** Most consecutive deaths on one boss before a kill (or without ever killing). */
export function longestDeathStreak(bossId: string, progress: Progress): number {
  const bp = progress[bossId];
  if (!bp) return 0;
  // Stored newest-first; reverse to get chronological order.
  const chronological = [...bp.attempts].reverse();
  let max = 0;
  let current = 0;
  for (const a of chronological) {
    if (a.type === 'death') {
      current += 1;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

/** Most bosses killed in a row each with 0 deaths. */
export function longestCleanStreak(progress: Progress, bosses: Boss[]): number {
  const defeatedBosses = bosses
    .filter((b) => progress[b.id]?.defeated)
    .map((b) => {
      const bp = progress[b.id];
      const killAttempt = bp.attempts.find((a) => a.type === 'kill');
      return { boss: b, killedAt: killAttempt?.timestamp ?? 0, deaths: deathsFor(bp) };
    })
    .sort((a, b) => a.killedAt - b.killedAt);

  let max = 0;
  let current = 0;
  for (const entry of defeatedBosses) {
    if (entry.deaths === 0) {
      current += 1;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

/**
 * Rage level for a single boss — consecutive recent deaths each < 10 min apart.
 * Walks backwards from the most recent attempt.
 */
export function rageLevel(bossId: string, progress: Progress): number {
  const bp = progress[bossId];
  if (!bp) return 0;
  // Attempts are newest-first; walk forward from index 0 (most recent).
  const attempts = bp.attempts;
  let count = 0;
  let prevTimestamp: number | null = null;
  for (const a of attempts) {
    if (a.type !== 'death') break; // stop on first non-death (kill or gap)
    if (prevTimestamp !== null && prevTimestamp - a.timestamp > TEN_MINUTES) break;
    count += 1;
    prevTimestamp = a.timestamp;
  }
  return count;
}

/** Highest rage level ever recorded — peaks, not current. */
export function highestRageEver(progress: Progress, bosses: Boss[]): RageResult {
  let best: RageResult = null;
  for (const boss of bosses) {
    const rage = peakRage(boss.id, progress);
    if (best === null || rage > best.rage) {
      best = { boss, rage };
    }
  }
  return best && best.rage > 0 ? best : null;
}

/** Peak rage streak ever on one boss (any window of consecutive rapid deaths). */
export function peakRage(bossId: string, progress: Progress): number {
  const bp = progress[bossId];
  if (!bp) return 0;
  const deaths = [...bp.attempts]
    .filter((a) => a.type === 'death')
    .sort((a, b) => a.timestamp - b.timestamp); // chronological

  let max = 0;
  let current = 0;
  let prevTs: number | null = null;
  for (const a of deaths) {
    if (prevTs === null || a.timestamp - prevTs < TEN_MINUTES) {
      current += 1;
      if (current > max) max = current;
    } else {
      current = 1;
    }
    prevTs = a.timestamp;
  }
  return max;
}

/** Boss with the longest death streak ever recorded. */
export function hardestStreak(progress: Progress, bosses: Boss[]): StreakResult {
  let best: StreakResult = null;
  for (const boss of bosses) {
    const streak = longestDeathStreak(boss.id, progress);
    if (best === null || streak > best.streak) {
      best = { boss, streak };
    }
  }
  return best && best.streak > 0 ? best : null;
}
