import { npmExec } from '../exec/npm.js';
import {
  resolveCacheOption,
  type CacheOption,
} from '../internal/tool/cache.js';
import { resolveToolTarget, type ToolTarget } from '../internal/tool/target.js';
import { defineLintTool } from '../tool.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';

export interface EslintToolOptions extends DefaultToolOptions {
  target?: ToolTarget;
  cache?: CacheOption;
}

export function eslint(options?: EslintToolOptions) {
  return defineLintTool({
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
