import { npmExec } from '../exec/npm.js';
import {
  resolveCacheOption,
  type CacheOption,
} from '../internal/tool/cache.js';
import type { MaybeArray } from '../internal/maybeArray.js';
import { resolveToolTarget, type ToolTarget } from '../internal/tool/target.js';
import { defineLintPhase } from '../phase.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';

const DEFAULT_TARGET = '**/*.css';

export interface StylelintPhaseOptions extends DefaultToolOptions {
  target?: ToolTarget;
  cache?: CacheOption;
  cliOptions?: MaybeArray<string>;
}

export function stylelint(options?: StylelintPhaseOptions) {
  return defineLintPhase({
    name: 'stylelint',
    cli: {
      stylelint: { default: options?.executeByDefault ?? true },
    },
    when: ({ stylelint }) => stylelint,
    execute: npmExec([
      'stylelint',
      options?.target === undefined
        ? DEFAULT_TARGET
        : resolveToolTarget(options.target),
      ({ fix }) => fix && '--fix',
      resolveCacheOption(options?.cache),
      options?.cliOptions,
    ]),
  });
}
