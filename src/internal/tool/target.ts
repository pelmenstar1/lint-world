import type { UnresolvedCommandAtom } from '../../command.js';
import { normalizeMaybeArray, type MaybeArray } from '../maybeArray.js';

export type ToolTarget = MaybeArray<string>;

export function resolveToolTarget(
  target: MaybeArray<string> | undefined,
): UnresolvedCommandAtom {
  if (target === undefined) {
    return '.';
  }

  return normalizeMaybeArray(target);
}
