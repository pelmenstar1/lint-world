import { normalizeMaybeArray, type MaybeArray } from './internal/maybeArray.js';
import type { Falsy } from './internal/types.js';

export type ResolvedCommand = string[];

export type UnresolvedCommandAtom = MaybeArray<string | Falsy>;
export type UnresolvedCommandAtomFn<Args> =
  UnresolvedCommandAtom | ((args: Args) => MaybeArray<UnresolvedCommandAtom>);

export type UnresolvedCommand<Args> = MaybeArray<UnresolvedCommandAtomFn<Args>>;

function resolveAtom<Args>(atom: UnresolvedCommandAtomFn<Args>, args: Args) {
  if (typeof atom === 'function') {
    return atom(args);
  }

  return atom;
}

export function resolveCommand<Args>(
  command: UnresolvedCommand<Args>,
  args: Args,
): ResolvedCommand {
  return normalizeMaybeArray(command)
    .map((atom) => resolveAtom(atom, args))
    .flat(2)
    .filter(
      (atom): atom is string => typeof atom === 'string' && atom.length > 0,
    );
}
