import { describe, expect, it, vi } from 'vitest';
import { resolveCommand } from '../command.js';
import { npmExec } from '../exec/npm.js';
import { tsc } from '../tools/tsc.js';

vi.mock('../exec/npm.js', () => ({
  npmExec: vi.fn(() => vi.fn()),
}));

interface Args {
  fix: boolean;
  parallel: boolean;
  tsc: boolean;
}

const args: Args = { fix: false, parallel: false, tsc: true };

/**
 * Resolves the command the tool handed to the mocked {@link npmExec}.
 */
function lastCommand(): string[] {
  const [command] = vi.mocked(npmExec<Args>).mock.lastCall ?? [];

  return resolveCommand(command, args);
}

describe('tsc', () => {
  it('does not pass --noEmit in build mode', () => {
    tsc({ build: 'tsconfig.build.json' });

    const command = lastCommand();

    expect(command).not.toContain('--noEmit');
    expect(command).toEqual(['tsc', '-b', 'tsconfig.build.json']);
  });
});
