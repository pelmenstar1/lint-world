import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../config.js';

const fixturesDir = path.join(import.meta.dirname, 'fixtures');

function fixture(name: string): string {
  return path.join(fixturesDir, name);
}

describe('loadConfig', () => {
  it.each([
    { ext: 'ts', dir: 'ts-config', toolName: 'ts-tool' },
    { ext: 'js', dir: 'js-config', toolName: 'js-tool' },
    { ext: 'mjs', dir: 'mjs-config', toolName: 'mjs-tool' },
    { ext: 'cjs', dir: 'cjs-config', toolName: 'cjs-tool' },
  ])('loads a .$ext config file', async ({ dir, toolName }) => {
    const config = await loadConfig(fixture(dir));

    expect(config.tools).toHaveLength(1);
    expect(config.tools[0]?.name).toBe(toolName);
  });

  it('prefers .js over .ts when both are present', async () => {
    const config = await loadConfig(fixture('priority-config'));

    expect(config.tools[0]?.name).toBe('priority-js-tool');
  });

  it('throws when no config file is found', async () => {
    await expect(loadConfig(fixture('missing-config'))).rejects.toThrow();
  });
});
