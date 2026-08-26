import { npmExec } from '../exec/npm.js';
import type { DefaultToolOptions } from '../internal/tool/types.js';
import { defineLintTool } from '../tool.js';

export interface TscToolOptions extends DefaultToolOptions {
  build?: string;
  noEmit?: boolean;
}

export function tsc(options?: TscToolOptions) {
  const isBuildMode = options?.build !== undefined;
  const noEmit = options?.noEmit ?? !isBuildMode;

  return defineLintTool({
    name: 'tsc',
    cli: {
      tsc: { default: options?.executeByDefault ?? true },
    },
    when: ({ fix, tsc }) => !fix && tsc,
    execute: npmExec([
      'tsc',
      noEmit && '--noEmit',
      isBuildMode && ['-b', options.build],
      options?.cliOptions,
    ]),
  });
}
