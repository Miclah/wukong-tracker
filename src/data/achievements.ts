import type { Boss, BossProgress, FavoriteGif } from '../types';
import { totalDeaths, longestCleanStreak, peakRage, chapterProgress } from '../lib/stats';

type Progress = Record<string, BossProgress>;

export type AchievementCategory = '受' | '勝' | '賢';

export interface Achievement {
  id: string;
  name: string;
  nameZh: string;        // 2–4 char Chinese name for seal
  description: string;
  lockedHint: string;    // poetic hint shown on hover when locked
  category: AchievementCategory;
  check: (progress: Progress, bosses: Boss[], favoriteGifs?: FavoriteGif[]) => boolean;
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
    nameZh: '初血',
    description: 'Defeat your first boss.',
    lockedHint: 'Your first red thread awaits.',
    category: '受',
    check: (p) => Object.values(p).some((bp) => bp.defeated),
  },
  {
    id: 'no-mercy',
    name: 'No Mercy',
    nameZh: '無情',
    description: 'Defeat any boss on the first attempt (0 deaths).',
    lockedHint: 'Strike like lightning. Leave no room for death.',
    category: '勝',
    check: (p) =>
      Object.values(p).some(
        (bp) => bp.defeated && (bp.defeatedAtDeathCount ?? deathsFor(bp)) === 0,
      ),
  },
  {
    id: 'skill-issue',
    name: 'Skill Issue',
    nameZh: '技短',
    description: '50 or more deaths on a single boss.',
    lockedHint: 'The mountain does not judge. It simply endures.',
    category: '受',
    check: (p) => Object.values(p).some((bp) => deathsFor(bp) >= 50),
  },
  {
    id: 'iron-will',
    name: 'Iron Will',
    nameZh: '鐵心',
    description: 'Suffer 30+ deaths on a boss and still defeat it.',
    lockedHint: 'To fall thirty times and rise once more — this is the pilgrim\'s way.',
    category: '勝',
    check: (p) =>
      Object.values(p).some((bp) => bp.defeated && deathsFor(bp) >= 30),
  },
  {
    id: 'persistence',
    name: 'Persistence',
    nameZh: '百死',
    description: '100 or more total deaths across all bosses.',
    lockedHint: 'One hundred lessons. Still standing.',
    category: '受',
    check: (p) => totalDeaths(p) >= 100,
  },
  {
    id: 'suffering',
    name: 'The Suffering',
    nameZh: '受難',
    description: '300 or more total deaths. The mountain truly laughs.',
    lockedHint: 'Three hundred deaths. The Sage bows to you.',
    category: '受',
    check: (p) => totalDeaths(p) >= 300,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    nameZh: '老兵',
    description: 'Defeat 10 or more bosses.',
    lockedHint: 'Ten conquered. The path widens.',
    category: '勝',
    check: (p) => Object.values(p).filter((bp) => bp.defeated).length >= 10,
  },
  {
    id: 'chapter-cleared',
    name: 'Chapter Cleared',
    nameZh: '章清',
    description: 'Defeat every boss in any chapter.',
    lockedHint: 'A chapter ends. The scroll continues.',
    category: '勝',
    check: (p, bosses) =>
      chapterProgress(p, bosses).some((cp) => cp.total > 0 && cp.defeated === cp.total),
  },
  {
    id: 'destined-one',
    name: 'Destined One',
    nameZh: '天命',
    description: 'Defeat every boss in the game.',
    lockedHint: 'Every peak remembered. Every beast vanquished.',
    category: '勝',
    check: (p, bosses) => bosses.every((b) => p[b.id]?.defeated),
  },
  {
    id: 'clean-sweep',
    name: 'Clean Sweep',
    nameZh: '清掃',
    description: 'Defeat 3 or more bosses in a row without dying.',
    lockedHint: 'Three bosses, not one death. The road was merciful.',
    category: '勝',
    check: (p, bosses) => longestCleanStreak(p, bosses) >= 3,
  },
  {
    id: 'rage-incarnate',
    name: 'Rage Incarnate',
    nameZh: '大怒',
    description: '10+ consecutive rapid deaths on a single boss (< 10 min apart).',
    lockedHint: 'Ten deaths in ten minutes. Fury made flesh.',
    category: '受',
    check: (p, bosses) => bosses.some((b) => peakRage(b.id, p) >= 10),
  },
  {
    id: 'sage',
    name: 'Sage',
    nameZh: '賢者',
    description: 'Write strategy notes on 10 or more bosses.',
    lockedHint: 'Ten notes of wisdom. The sage within awakens.',
    category: '賢',
    check: (p) => Object.values(p).filter((bp) => bp.notes && bp.notes.trim().length > 0).length >= 10,
  },
  {
    id: 'chronicler',
    name: 'Chronicler',
    nameZh: '記事',
    description: 'Write your first strategy note.',
    lockedHint: 'First words written. The journal begins.',
    category: '賢',
    check: (p) => Object.values(p).some((bp) => bp.notes && bp.notes.trim().length > 0),
  },
  {
    id: 'speed-sage',
    name: 'Speed Sage',
    nameZh: '疾賢',
    description: 'Defeat Yellow Wind Sage with under 5 minutes total logged fight time.',
    lockedHint: 'Swift as the wind, true as the thunder.',
    category: '賢',
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
    nameZh: '快手',
    description: 'Defeat any boss with under 2 minutes total logged fight time.',
    lockedHint: 'Two minutes. Done.',
    category: '賢',
    check: (p) =>
      Object.values(p).some(
        (bp) => bp.defeated && fightTimeFor(bp) > 0 && fightTimeFor(bp) < 2,
      ),
  },
  {
    id: 'night-sage',
    name: 'Night Sage',
    nameZh: '夜賢',
    description: '10+ attempts logged between midnight and 4 AM.',
    lockedHint: 'The mountain is quietest before dawn.',
    category: '受',
    check: (p) => {
      let count = 0;
      for (const bp of Object.values(p)) {
        for (const a of bp.attempts) {
          const hour = new Date(a.timestamp).getHours();
          if (hour < 4) count++;
        }
      }
      return count >= 10;
    },
  },
  {
    id: 'comeback',
    name: 'Comeback',
    nameZh: '回擊',
    description: 'Defeat a boss immediately after 10+ consecutive deaths.',
    lockedHint: 'Every fall is practice for the rise.',
    category: '勝',
    check: (p) =>
      Object.values(p).some((bp) => {
        if (!bp.defeated) return false;
        // attempts are newest-first; index 0 is the kill, 1+ are prior deaths
        if (bp.attempts[0]?.type !== 'kill') return false;
        let streak = 0;
        for (let i = 1; i < bp.attempts.length; i++) {
          if (bp.attempts[i].type === 'death') streak++;
          else break;
        }
        return streak >= 10;
      }),
  },
  {
    id: 'marathon',
    name: 'Marathon',
    nameZh: '長跑',
    description: '50+ attempts within a single 4-hour session.',
    lockedHint: 'Some journeys require stamina above all else.',
    category: '受',
    check: (p) => {
      const ts = Object.values(p)
        .flatMap((bp) => bp.attempts.map((a) => a.timestamp))
        .sort((a, b) => a - b);
      if (ts.length < 50) return false;
      const FOUR_HOURS = 4 * 60 * 60 * 1000;
      for (let i = 0; i <= ts.length - 50; i++) {
        if (ts[i + 49] - ts[i] <= FOUR_HOURS) return true;
      }
      return false;
    },
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    nameZh: '述者',
    description: 'Add notes to 25 or more individual attempts.',
    lockedHint: 'The one who writes, remembers.',
    category: '賢',
    check: (p) => {
      let count = 0;
      for (const bp of Object.values(p)) {
        for (const a of bp.attempts) {
          if (a.note && a.note.trim().length > 0) count++;
        }
      }
      return count >= 25;
    },
  },
  {
    id: 'curator',
    name: 'Curator',
    nameZh: '藏家',
    description: 'Favorite 10 or more GIFs.',
    lockedHint: 'A collection of sorrows and triumphs.',
    category: '賢',
    check: (_p, _bosses, favoriteGifs = []) => favoriteGifs.length >= 10,
  },
];

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
