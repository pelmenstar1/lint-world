import { npmExec } from '../exec/npm.js';
import type { MaybeArray } from '../internal/maybeArray.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';
import { defineLintPhase } from '../phase.js';

type CacheOption = boolean | { cacheLocation: string };

export interface KnipToolOptions extends DefaultToolOptions {
  cache?: CacheOption;
  cycles?: boolean;
  cliOptions?: MaybeArray<string>;
}

function resolveCacheOption(cache: CacheOption | undefined) {
  if (cache === true) {
    return '--cache';
  } else if (typeof cache === 'object') {
    return [
      '--cache',
      cache.cacheLocation && `--cache-location="${cache.cacheLocation}"`,
    ];
  }

  return [];
}

export function knip(options?: KnipToolOptions) {
  return defineLintPhase({
    name: 'knip',
    cli: {
      knip: { default: options?.executeByDefault ?? true },
    },
    when: ({ knip }) => knip,
    execute: npmExec([
      'knip',
      options?.cycles && '--cycles',
      ({ fix }) => fix && '--fix',
      resolveCacheOption(options?.cache),
      options?.cliOptions,
    ]),
  });
}
