import { npmExec } from '../exec/npm.js';
import {
  resolveCacheOption,
  type CacheOption,
} from '../internal/tool/cache.js';
import type { MaybeArray } from '../internal/maybeArray.js';
import { resolveToolTarget } from '../internal/tool/target.js';
import { defineLintPhase } from '../phase.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';

export interface PrettierOptions extends DefaultToolOptions {
  target?: MaybeArray<string>;
  cache?: CacheOption;
  cliOptions?: MaybeArray<string>;
}

export function prettier(options?: PrettierOptions) {
  return defineLintPhase({
    name: 'prettier',
    cli: {
      prettier: { default: options?.executeByDefault ?? true },
    },
    when: ({ prettier }) => prettier,
    execute: npmExec([
      'prettier',
      resolveToolTarget(options?.target),
      ({ fix }) => (fix ? '--write' : '--check'),
      resolveCacheOption(options?.cache),
      options?.cliOptions,
    ]),
  });
}
