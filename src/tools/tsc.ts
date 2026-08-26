import { npmExec } from '../exec/npm.js';
import type { MaybeArray } from '../internal/maybeArray.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';
import { defineLintTool } from '../tool.js';

export interface TscToolOptions extends DefaultToolOptions {
  cliOptions?: MaybeArray<string>;
}

export function tsc(options?: TscToolOptions) {
  return defineLintTool({
    name: 'tsc',
    cli: {
      tsc: { default: options?.executeByDefault ?? true },
    },
    when: ({ fix, tsc }) => !fix && tsc,
    execute: npmExec(['tsc', '--noEmit', options?.cliOptions]),
  });
}
