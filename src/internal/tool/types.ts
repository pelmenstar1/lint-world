import type { MaybeArray } from '../maybeArray.js';

export type DefaultToolOptions = {
  executeByDefault?: boolean;
  cliOptions?: MaybeArray<string>;
};
