import { npmExec } from '../exec/npm.js';
import {
  resolveCacheOption,
  type CacheOption,
} from '../internal/tool/cache.js';
import type { MaybeArray } from '../internal/maybeArray.js';
import { resolveToolTarget, type ToolTarget } from '../internal/tool/target.js';
import { defineLintTool } from '../tool.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';

export interface PrettierToolOptions extends DefaultToolOptions {
  target?: ToolTarget;
  cache?: CacheOption;
  cliOptions?: MaybeArray<string>;
}

export function prettier(options?: PrettierToolOptions) {
  return defineLintTool({
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
