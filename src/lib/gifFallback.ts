import type { GifData } from '../types';

const BASE = import.meta.env.BASE_URL ?? '/';

function makeLocal(category: 'death' | 'kill', count: number): GifData[] {
  return Array.from({ length: count }, (_, i) => {
    const file = `${BASE}gifs/fallback/${category}/${category}-${i + 1}.gif`;
    return { url: file, thumbnailUrl: file, description: `${category} ${i + 1}` };
  });
}

const FALLBACKS: Record<'death' | 'kill', GifData[]> = {
  death: makeLocal('death', 10),
  kill: makeLocal('kill', 10),
};

export function getFallbackGifs(category: 'death' | 'kill'): GifData[] {
  return FALLBACKS[category];
}
