import type { BossProgress } from '../types';

export interface BackupData {
  version: 1;
  exportedAt: number;
  progress: Record<string, BossProgress>;
  unlockedAchievements: string[];
}

export function exportJson(
  progress: Record<string, BossProgress>,
  unlockedAchievements: string[],
): void {
  const data: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    progress,
    unlockedAchievements,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `wukong-suffering-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBackup(json: string): BackupData {
  const data = JSON.parse(json) as BackupData;
  if (data.version !== 1) throw new Error('Unsupported backup version');
  if (!data.progress || typeof data.progress !== 'object') throw new Error('Invalid backup: missing progress');
  return data;
}
