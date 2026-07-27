import { npmExec } from '../exec/npm.js';
import {
  resolveCacheOption,
  type CacheOption,
} from '../internal/tool/cache.js';
import { type MaybeArray } from '../internal/maybeArray.js';
import { resolveToolTarget, type ToolTarget } from '../internal/tool/target.js';
import { defineLintPhase } from '../phase.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';

export interface EslintPhaseOptions extends DefaultToolOptions {
  target?: ToolTarget;
  cache?: CacheOption;
  cliOptions?: MaybeArray<string>;
}

export function eslint(options?: EslintPhaseOptions) {
  return defineLintPhase({
    name: 'eslint',
    cli: {
      eslint: { default: options?.executeByDefault ?? true },
    },
    when: ({ eslint }) => eslint,
    execute: npmExec([
      'eslint',
      resolveToolTarget(options?.target),
      ({ fix }) => fix && '--fix',
      resolveCacheOption(options?.cache),
      options?.cliOptions,
    ]),
  });
}
