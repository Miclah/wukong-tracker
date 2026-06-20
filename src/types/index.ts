export type BossType =
  | 'yaoguai-king'
  | 'yaoguai-chief'
  | 'elite-yaoguai'
  | 'hidden'
  | 'final';

export type Chapter = 1 | 2 | 3 | 4 | 5 | 6;

export interface Boss {
  id: string;
  name: string;
  nameZh: string;
  chapter: Chapter;
  location: string;
  type: BossType;
  imageUrl: string;
  lore?: string;
  fandomUrl: string;
  mapX: number;
  mapY: number;
}

export interface AttemptGif {
  url: string;
  thumbnailUrl: string;
  description: string;
}

export interface Attempt {
  id: string;
  type: 'death' | 'kill';
  timestamp: number;
  gif?: AttemptGif;
  note?: string;
}

export interface BossProgress {
  bossId: string;
  attempts: Attempt[];
  defeated: boolean;
  defeatedAtDeathCount: number | null;
}

export interface TrackerState {
  progress: Record<string, BossProgress>;
  reactionsEnabled: boolean;
  unlockedAchievements: string[];
}
