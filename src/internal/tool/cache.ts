import type { UnresolvedCommandAtom } from '../../command.js';

export type CacheOption =
  | boolean
  | {
      cacheLocation?: string;
      cacheStrategy?: 'metadata' | 'content';
    };

export function resolveCacheOption(
  cache: CacheOption | undefined,
): UnresolvedCommandAtom {
  if (typeof cache === 'boolean') {
    return cache ? '--cache' : [];
  }

  if (typeof cache === 'object') {
    return [
      '--cache',
      cache.cacheLocation && `--cache-location="${cache.cacheLocation}"`,
      cache.cacheStrategy && `--cache-strategy="${cache.cacheStrategy}"`,
    ];
  }

  return [];
}
