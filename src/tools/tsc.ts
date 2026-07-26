import { npmExec } from '../exec/npm.js';
import type { MaybeArray } from '../internal/maybeArray.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';
import { defineLintPhase } from '../phase.js';

export interface TscPhaseOptions extends DefaultToolOptions {
  cliOptions?: MaybeArray<string>;
}

export function tsc(options?: TscPhaseOptions) {
  return defineLintPhase({
    name: 'tsc',
    cli: {
      tsc: { default: options?.executeByDefault ?? true },
    },
    when: ({ fix, tsc }) => !fix && tsc,
    execute: npmExec(['tsc', '--noEmit', options?.cliOptions]),
  });
}
