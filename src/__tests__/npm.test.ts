import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { UnresolvedCommand } from '../command.js';
import { npmExec } from '../exec/npm.js';

const echoScript = path.join(
  import.meta.dirname,
  'fixtures',
  'echo-invocation.js',
);

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'lint-world-npm-exec-'));
});

afterAll(async () => {
  await fsp.rm(tmpDir, { recursive: true, force: true });
});

interface Invocation {
  args: string[];
  path: string;
}

let invocationCount = 0;

function invocationFile(): string {
  return path.join(tmpDir, `invocation-${++invocationCount}.json`);
}

async function readInvocation(file: string): Promise<Invocation> {
  const content = await fsp.readFile(file, 'utf8');

  return JSON.parse(content) as Invocation;
}

interface Args {
  target?: string;
  fix?: boolean;
}

describe('npmExec', () => {
  it('runs the executable with the remaining atoms as arguments', async () => {
    const outFile = invocationFile();

    await npmExec([process.execPath, echoScript, outFile, '--flag', 'value'])(
      {},
    );

    await expect(readInvocation(outFile)).resolves.toMatchObject({
      args: ['--flag', 'value'],
    });
  });

  it('runs the executable without arguments', async () => {
    const outFile = invocationFile();

    await npmExec([process.execPath, echoScript, outFile])({});

    await expect(readInvocation(outFile)).resolves.toMatchObject({
      args: [],
    });
  });

  it('resolves the command against the args of each execution', async () => {
    const fixedFile = invocationFile();
    const uncheckedFile = invocationFile();
    const execute = npmExec<Args>([
      process.execPath,
      echoScript,
      ({ target }) => target,
      ({ fix }) => fix && '--fix',
    ]);

    await execute({ target: fixedFile, fix: true });
    await execute({ target: uncheckedFile, fix: false });

    await expect(readInvocation(fixedFile)).resolves.toMatchObject({
      args: ['--fix'],
    });
    await expect(readInvocation(uncheckedFile)).resolves.toMatchObject({
      args: [],
    });
  });

  it('puts the local node_modules/.bin on the PATH of the child process', async () => {
    const outFile = invocationFile();
    const localBin = path.join(process.cwd(), 'node_modules', '.bin');
    const originalPath = process.env['PATH'] ?? '';

    // The test runner already exports every local .bin on its own PATH, so the
    // child would inherit one whether or not npmExec asks execa for it.
    process.env['PATH'] = originalPath
      .split(path.delimiter)
      .filter((entry) => path.basename(entry).toLowerCase() !== '.bin')
      .join(path.delimiter);

    try {
      await npmExec([process.execPath, echoScript, outFile])({});
    } finally {
      process.env['PATH'] = originalPath;
    }

    await expect(readInvocation(outFile)).resolves.toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      path: expect.stringContaining(localBin),
    });
  });

  it('rejects when the command exits with a non-zero code', async () => {
    await expect(
      npmExec([process.execPath, '-e', 'process.exit(1)'])({}),
    ).rejects.toThrow('exit code 1');
  });

  it('rejects when the executable cannot be found', async () => {
    await expect(
      npmExec('lint-world-no-such-executable')({}),
    ).rejects.toThrow();
  });

  it.each<{ command: UnresolvedCommand<Args> }>([
    { command: [] },
    { command: [null, false, ''] },
    { command: () => undefined },
  ])('throws when no executable resolves', async ({ command }) => {
    await expect(npmExec(command)({})).rejects.toThrow(
      'No executable found in command',
    );
  });

  describe('describe', () => {
    it('joins the resolved command without running it', async () => {
      const outFile = invocationFile();
      const execute = npmExec<Args>([
        'eslint',
        ({ target }) => target,
        ({ fix }) => fix && '--fix',
      ]);

      expect(execute.describe?.({ target: outFile, fix: true })).toBe(
        `eslint ${outFile} --fix`,
      );

      await expect(readInvocation(outFile)).rejects.toBeInstanceOf(Error);
    });

    it('omits atoms that resolve to nothing', () => {
      const execute = npmExec<Args>(['eslint', ({ fix }) => fix && '--fix']);

      expect(execute.describe?.({ fix: false })).toBe('eslint');
    });

    it('describes an empty command as an empty string', () => {
      expect(npmExec([]).describe?.({})).toBe('');
    });
  });
});
