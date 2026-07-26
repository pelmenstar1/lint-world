import { resolveCommand, type UnresolvedCommand } from '../command.js';
import { execa } from 'execa';
import type { LintPhaseExecution } from '../phase.js';

export function npmExec<Args>(
  command: UnresolvedCommand<Args>,
): LintPhaseExecution<Args> {
  return async (args) => {
    const resolvedCommand = resolveCommand(command, args);
    const [executable, ...commandArgs] = resolvedCommand;
    if (!executable) {
      throw new Error('No executable found in command');
    }

    await execa(executable, commandArgs, {
      preferLocal: true,
    });
  };
}
