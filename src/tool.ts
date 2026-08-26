import type { MaybePromise } from './internal/types.js';

type DefaultArgKey = 'fix' | 'parallel';
type ArgMap<Key extends string = never> = Record<DefaultArgKey | Key, boolean>;

/**
 * Provides a way to execute a tool using provided {@link Args | arguments}
 */
export type LintToolExecution<Args> = (args: Args) => MaybePromise<void>;

/**
 * Describes a command line argument for a tool. It can only be a boolean flag.
 */
export type CliArgumentDescriptor = {
  /**
   * Default value for the argument if it's not specified.
   */
  default: boolean;
};

export type CliArgumentMap<ExtendedArg extends string = never> = {
  [K in ExtendedArg]: CliArgumentDescriptor;
};

export type BaseLintTool<Args> = {
  /**
   * Name of the tool, used for logging and as a command line argument (to invoke the tool).
   */
  name: string;

  /**
   * Determines whether the tool should be executed based on the provided arguments.
   *
   * If it's not specified, the tool will always be executed.
   */
  when?: (args: Args) => boolean;

  /**
   * Executes the tool with the provided arguments.
   */
  execute: LintToolExecution<Args>;
};

export type LintTool<ExtendedArg extends string = never> = BaseLintTool<
  ArgMap<ExtendedArg>
> & {
  /**
   * Describes the command line arguments for the tool.
   *
   * If it's not specified, the tool will not have any additional command line arguments.
   */
  cli?: CliArgumentMap<ExtendedArg>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLintTool = LintTool<any>;

/**
 * A helper to define a lint tool, primarily for type inference.
 *
 * @example
 * import { defineLintTool } from 'lint-world';
 *
 * export const myTool = defineLintTool({
 *   name: 'my-tool',
 *   cli: {
 *     myTool: { default: true },
 *   },
 *   when: ({ myTool }) => myTool,
 *   execute: async (args) => {
 *     if (args.myTool) {
 *       // Execute the tool
 *     }
 *   },
 * });
 */
export function defineLintTool<ExtendedArg extends string = never>(
  value: LintTool<ExtendedArg>,
): LintTool<ExtendedArg> {
  return value;
}
