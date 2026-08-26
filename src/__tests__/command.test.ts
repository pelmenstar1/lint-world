import { describe, expect, it, vi } from 'vitest';
import {
  resolveCommand,
  type ResolvedCommand,
  type UnresolvedCommand,
} from '../command.js';

interface Args {
  target?: string;
  fix?: boolean;
}

describe('resolveCommand', () => {
  it.each<{
    command: UnresolvedCommand<Args>;
    args: Args;
    expected: ResolvedCommand;
  }>([
    { command: 'eslint', args: {}, expected: ['eslint'] },
    {
      command: ['eslint', '.', '--fix'],
      args: {},
      expected: ['eslint', '.', '--fix'],
    },
    { command: [], args: {}, expected: [] },
    { command: null, args: {}, expected: [] },
    { command: undefined, args: {}, expected: [] },
    { command: false, args: {}, expected: [] },
    { command: '', args: {}, expected: [] },
    {
      command: ['eslint', null, '.', undefined, false, '', '--fix'],
      args: {},
      expected: ['eslint', '.', '--fix'],
    },
    {
      command: ['knip', ['--cache', '--cycles']],
      args: {},
      expected: ['knip', '--cache', '--cycles'],
    },
    {
      command: ['knip', () => [['--cache'], '--cycles']],
      args: {},
      expected: ['knip', '--cache', '--cycles'],
    },
    {
      command: ['eslint', ({ fix }) => fix && '--fix'],
      args: { fix: true },
      expected: ['eslint', '--fix'],
    },
    {
      command: ['eslint', ({ fix }) => fix && '--fix'],
      args: { fix: false },
      expected: ['eslint'],
    },
    {
      command: ({ target }) => target,
      args: { target: 'tsc' },
      expected: ['tsc'],
    },
    {
      command: [
        'prettier',
        () => null,
        () => [undefined, false, ''],
        () => '--write',
      ],
      args: {},
      expected: ['prettier', '--write'],
    },
    {
      command: [
        'eslint',
        ({ target }) => target,
        ({ fix }) => fix && '--fix',
        ['--cache', '--cache-location=.cache/eslint'],
        undefined,
      ],
      args: { target: 'src', fix: true },
      expected: [
        'eslint',
        'src',
        '--fix',
        '--cache',
        '--cache-location=.cache/eslint',
      ],
    },
  ])('resolves the command', ({ command, args, expected }) => {
    expect(resolveCommand(command, args)).toEqual(expected);
  });

  it('passes the same args to every function atom', () => {
    const first = vi.fn(() => 'a');
    const second = vi.fn(() => 'b');
    const args = { fix: true };

    resolveCommand([first, second], args);

    expect(first).toHaveBeenCalledExactlyOnceWith(args);
    expect(second).toHaveBeenCalledExactlyOnceWith(args);
  });
});
