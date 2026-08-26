import type { MaybePromise } from './internal/types.js';

type DefaultArgKey = 'fix' | 'parallel';
type ArgMap<Key extends string = never> = Record<DefaultArgKey | Key, boolean>;

export type LintToolExecution<Args> = (args: Args) => MaybePromise<void>;

export type CliArgumentDescriptor = {
  default: boolean;
};

export type CliArgumentMap<ExtendedArg extends string = never> = {
  [K in ExtendedArg]: CliArgumentDescriptor;
};

export type LintTool<ExtendedArg extends string = never> = BaseLintTool<
  ArgMap<ExtendedArg>
> & {
  cli?: CliArgumentMap<ExtendedArg>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLintTool = LintTool<any>;

export type BaseLintTool<Args> = {
  name: string;
  when?: (args: Args) => boolean;
  execute: LintToolExecution<Args>;
};

export function defineLintTool<ExtendedArg extends string = never>(
  value: LintTool<ExtendedArg>,
): LintTool<ExtendedArg> {
  return value;
}
