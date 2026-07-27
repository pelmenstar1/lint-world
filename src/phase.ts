import type { MaybePromise } from './internal/types.js';

type DefaultArgKey = 'fix' | 'parallel';
type ArgMap<Key extends string = never> = Record<DefaultArgKey | Key, boolean>;

export type LintPhaseExecution<Args> = (args: Args) => MaybePromise<void>;

export type CliArgumentDescriptor = {
  default: boolean;
};

export type CliArgumentMap<ExtendedArg extends string = never> = {
  [K in ExtendedArg]: CliArgumentDescriptor;
};

export type LintPhase<ExtendedArg extends string = never> = BaseLintPhase<
  ArgMap<ExtendedArg>
> & {
  cli?: CliArgumentMap<ExtendedArg>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLintPhase = LintPhase<any>;

export type BaseLintPhase<Args> = {
  name: string;
  when?: (args: Args) => boolean;
  execute: LintPhaseExecution<Args>;
};

export function defineLintPhase<ExtendedArg extends string = never>(
  phase: LintPhase<ExtendedArg>,
): LintPhase<ExtendedArg> {
  return phase;
}
