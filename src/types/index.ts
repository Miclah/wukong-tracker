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
  focalPoint?: { x: number; y: number };
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
  fightTimeMinutes?: number;
};

export type Difficulty = 0 | 1 | 2 | 3 | 4 | 5;

export type BossProgress = {
  bossId: string;
  attempts: Attempt[];
  defeated: boolean;
  defeatedAtDeathCount: number | null;
  notes?: string;
  difficulty?: Difficulty;
};

export type FavoriteGif = {
  url: string;
  thumbnailUrl: string;
  description: string;
  addedAt: number;
};

export type TrackerState = {
  progress: Record<string, BossProgress>;
  reactionsEnabled: boolean;
  unlockedAchievements: string[];
  theme: 'dark' | 'light';
  lastBackupAt: number | null;
  favoriteGifs: FavoriteGif[];
};

export type TrackerActions = {
  logAttempt: (bossId: string, attempt: Omit<Attempt, 'id' | 'timestamp'>) => void;
  markDefeated: (bossId: string, options?: { note?: string; gif?: GifData; fightTimeMinutes?: number }) => void;
  resetBoss: (bossId: string) => void;
  setBossNotes: (bossId: string, notes: string) => void;
  setBossDifficulty: (bossId: string, difficulty: Difficulty) => void;
  restoreFromBackup: (progress: Record<string, BossProgress>, unlockedAchievements: string[]) => void;
  setReactionsEnabled: (enabled: boolean) => void;
  unlockAchievement: (achievementId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLastBackupAt: (ts: number) => void;
  toggleFavoriteGif: (gif: GifData) => void;
};
