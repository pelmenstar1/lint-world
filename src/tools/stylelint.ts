import { npmExec } from '../exec/npm.js';
import {
  resolveCacheOption,
  type CacheOption,
} from '../internal/tool/cache.js';
import { resolveToolTarget, type ToolTarget } from '../internal/tool/target.js';
import { defineLintTool } from '../tool.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';

const DEFAULT_TARGET = '**/*.css';

export interface StylelintToolOptions extends DefaultToolOptions {
  target?: ToolTarget;
  cache?: CacheOption;
}

export function stylelint(options?: StylelintToolOptions) {
  return defineLintTool({
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
