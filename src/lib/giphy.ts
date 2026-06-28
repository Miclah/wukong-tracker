import { GiphyFetch } from '@giphy/js-fetch-api';
import type { GifData } from '../types';

const CACHE_TTL_MS = 60 * 60 * 1000;

type CacheEntry = { data: GifData[]; expiresAt: number };

const cache = new Map<string, CacheEntry>();

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY ?? '');

const DEATH_QUERIES = ['rage quit', 'suffering', 'sadge', 'skill issue', 'pain', 'why', 'you died'];
const KILL_QUERIES = ['victory', "let's go", 'celebration', 'finally', 'GG', 'we did it', 'boss defeated'];

let deathIdx = 0;
let killIdx = 0;

export function nextDeathQuery(): string {
  return DEATH_QUERIES[deathIdx++ % DEATH_QUERIES.length];
}

export function nextKillQuery(): string {
  return KILL_QUERIES[killIdx++ % KILL_QUERIES.length];
}

export function randomQuery(type: 'death' | 'kill'): string {
  const list = type === 'death' ? DEATH_QUERIES : KILL_QUERIES;
  return list[Math.floor(Math.random() * list.length)];
}

export async function searchGifs(query: string, limit = 20): Promise<GifData[]> {
  const key = `${query}:${limit}`;
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.data;

  const { data } = await gf.search(query, { limit, type: 'gifs' });
  const gifs: GifData[] = data.map((gif) => ({
    url: gif.images.fixed_height.url,
    thumbnailUrl: gif.images.fixed_height_small.url,
    description: gif.title,
  }));
  cache.set(key, { data: gifs, expiresAt: Date.now() + CACHE_TTL_MS });
  return gifs;
}

export function pickRandom(gifs: GifData[]): GifData | null {
  if (!gifs.length) return null;
  return gifs[Math.floor(Math.random() * gifs.length)];
}
