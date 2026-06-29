import * as lzString from 'lz-string';
import type { Boss, BossProgress, FavoriteGif } from '../types';
import { longestCleanStreak, longestDeathStreak, peakRage } from './stats';

/** Per-boss summary encoded into the share URL. No GIFs, no notes, no timestamps. */
export type BossSnapshot = {
  d: number;        // death count
  k: boolean;       // defeated
  kd: number | null; // defeatedAtDeathCount (deaths at the moment of kill)
  ds: number;       // longest death streak on this boss
  pr: number;       // peak rage on this boss
};

export type SharedSummary = {
  v: 1;
  bosses: Record<string, BossSnapshot>;
  cleanStreak: number;
};

/**
 * Full-state share payload (v2). Carries complete progress including all
 * attempts, GIF URLs, notes, achievements, and favorites.
 * GIFs are URL references only — no embedded binary data.
 */
export type SharePayload = {
  v: 2;
  progress: Record<string, BossProgress>;
  achievements: string[];
  favoriteGifs: FavoriteGif[];
  theme: 'light';
};

export function encodeShareState(
  progress: Record<string, BossProgress>,
  bosses: Boss[],
): string {
  const snapshots: Record<string, BossSnapshot> = {};

  for (const [bossId, bp] of Object.entries(progress)) {
    if (bp.attempts.length === 0) continue;
    const deaths = bp.attempts.filter((a) => a.type === 'death').length;
    snapshots[bossId] = {
      d: deaths,
      k: bp.defeated,
      kd: bp.defeatedAtDeathCount,
      ds: longestDeathStreak(bossId, progress),
      pr: peakRage(bossId, progress),
    };
  }

  const summary: SharedSummary = {
    v: 1,
    bosses: snapshots,
    cleanStreak: longestCleanStreak(progress, bosses),
  };

  return lzString.compressToEncodedURIComponent(JSON.stringify(summary));
}

export function decodeShareState(encoded: string): SharedSummary | null {
  try {
    const json = lzString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as SharedSummary;
    if (parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Build the full share URL for the current page with the encoded state as `?s=`. */
export function buildShareUrl(encoded: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('s', encoded);
  return url.toString();
}

/**
 * Encode the full playthrough state into a compressed URI-safe string.
 * The resulting string is meant for `?s=` query param via `buildShareUrl`.
 */
export function encodeState(state: {
  progress: Record<string, BossProgress>;
  achievements: string[];
  favoriteGifs: FavoriteGif[];
}): string {
  const payload: SharePayload = {
    v: 2,
    progress: state.progress,
    achievements: state.achievements,
    favoriteGifs: state.favoriteGifs,
    theme: 'light',
  };
  return lzString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Decode a full-state share string produced by `encodeState`. Returns null if invalid or wrong version. */
export function decodeState(encoded: string): SharePayload | null {
  try {
    const json = lzString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as SharePayload;
    if (parsed.v !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}
