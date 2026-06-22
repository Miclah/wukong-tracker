export type Chapter = 1 | 2 | 3 | 4 | 5 | 6;

export type BossType =
  | 'yaoguai-king'
  | 'yaoguai-chief'
  | 'elite-yaoguai'
  | 'hidden'
  | 'final';

export type Boss = {
  id: string;
  name: string;
  nameZh: string;
  chapter: 1 | 2 | 3 | 4 | 5 | 6;
  location: string;
  type: BossType;
  imageUrl: string;
  mapX: number;
  mapY: number;
  lore?: string;
  fandomUrl: string;
};

export type GifData = {
  url: string;
  thumbnailUrl: string;
  description: string;
};

export type AttemptType = 'death' | 'kill';

export type Attempt = {
  id: string;
  type: AttemptType;
  timestamp: number;
  gif?: GifData;
  note?: string;
};

export type BossProgress = {
  bossId: string;
  attempts: Attempt[];
  defeated: boolean;
  defeatedAtDeathCount: number | null;
};

export type TrackerState = {
  progress: Record<string, BossProgress>;
  reactionsEnabled: boolean;
  unlockedAchievements: string[];
  theme: 'dark' | 'light';
  lastBackupAt: number | null;
};

export type TrackerActions = {
  logAttempt: (bossId: string, attempt: Omit<Attempt, 'id' | 'timestamp'>) => void;
  markDefeated: (bossId: string, options?: { note?: string; gif?: GifData }) => void;
  resetBoss: (bossId: string) => void;
  setReactionsEnabled: (enabled: boolean) => void;
  unlockAchievement: (achievementId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLastBackupAt: (ts: number) => void;
};
