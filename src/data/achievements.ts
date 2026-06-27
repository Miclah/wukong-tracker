import type { Boss, BossProgress } from '../types';
import { totalDeaths, longestCleanStreak, peakRage, chapterProgress } from '../lib/stats';

type Progress = Record<string, BossProgress>;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  check: (progress: Progress, bosses: Boss[]) => boolean;
}

function deathsFor(bp: BossProgress) {
  return bp.attempts.filter((a) => a.type === 'death').length;
}

function fightTimeFor(bp: BossProgress) {
  return bp.attempts.reduce((s, a) => s + (a.fightTimeMinutes ?? 0), 0);
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Defeat your first boss.',
    check: (p) => Object.values(p).some((bp) => bp.defeated),
  },
  {
    id: 'no-mercy',
    name: 'No Mercy',
    description: 'Defeat any boss on the first attempt (0 deaths).',
    check: (p) =>
      Object.values(p).some(
        (bp) => bp.defeated && (bp.defeatedAtDeathCount ?? deathsFor(bp)) === 0,
      ),
  },
  {
    id: 'skill-issue',
    name: 'Skill Issue',
    description: '50 or more deaths on a single boss.',
    check: (p) => Object.values(p).some((bp) => deathsFor(bp) >= 50),
  },
  {
    id: 'iron-will',
    name: 'Iron Will',
    description: 'Suffer 30+ deaths on a boss and still defeat it.',
    check: (p) =>
      Object.values(p).some((bp) => bp.defeated && deathsFor(bp) >= 30),
  },
  {
    id: 'persistence',
    name: 'Persistence',
    description: '100 or more total deaths across all bosses.',
    check: (p) => totalDeaths(p) >= 100,
  },
  {
    id: 'suffering',
    name: 'The Suffering',
    description: '300 or more total deaths. The mountain truly laughs.',
    check: (p) => totalDeaths(p) >= 300,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Defeat 10 or more bosses.',
    check: (p) => Object.values(p).filter((bp) => bp.defeated).length >= 10,
  },
  {
    id: 'chapter-cleared',
    name: 'Chapter Cleared',
    description: 'Defeat every boss in any chapter.',
    check: (p, bosses) =>
      chapterProgress(p, bosses).some((cp) => cp.total > 0 && cp.defeated === cp.total),
  },
  {
    id: 'destined-one',
    name: 'Destined One',
    description: 'Defeat every boss in the game.',
    check: (p, bosses) => bosses.every((b) => p[b.id]?.defeated),
  },
  {
    id: 'clean-sweep',
    name: 'Clean Sweep',
    description: 'Defeat 3 or more bosses in a row without dying.',
    check: (p, bosses) => longestCleanStreak(p, bosses) >= 3,
  },
  {
    id: 'rage-incarnate',
    name: 'Rage Incarnate',
    description: '10+ consecutive rapid deaths on a single boss (< 10 min apart).',
    check: (p, bosses) => bosses.some((b) => peakRage(b.id, p) >= 10),
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Write strategy notes on 10 or more bosses.',
    check: (p) => Object.values(p).filter((bp) => bp.notes && bp.notes.trim().length > 0).length >= 10,
  },
  {
    id: 'chronicler',
    name: 'Chronicler',
    description: 'Write your first strategy note.',
    check: (p) => Object.values(p).some((bp) => bp.notes && bp.notes.trim().length > 0),
  },
  {
    id: 'speed-sage',
    name: 'Speed Sage',
    description: 'Defeat Yellow Wind Sage with under 5 minutes total logged fight time.',
    check: (p, bosses) => {
      const sage = bosses.find((b) => b.id === 'yellow-wind-sage');
      if (!sage) return false;
      const bp = p[sage.id];
      if (!bp?.defeated) return false;
      return fightTimeFor(bp) > 0 && fightTimeFor(bp) < 5;
    },
  },
  {
    id: 'speedster',
    name: 'Speedster',
    description: 'Defeat any boss with under 2 minutes total logged fight time.',
    check: (p) =>
      Object.values(p).some(
        (bp) => bp.defeated && fightTimeFor(bp) > 0 && fightTimeFor(bp) < 2,
      ),
  },
];

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
