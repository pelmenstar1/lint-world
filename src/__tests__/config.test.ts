import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../config.js';

const fixturesDir = path.join(import.meta.dirname, 'fixtures');

function fixture(name: string): string {
  return path.join(fixturesDir, name);
}

describe('loadConfig', () => {
  it.each([
    { ext: 'ts', dir: 'ts-config', phaseName: 'ts-phase' },
    { ext: 'js', dir: 'js-config', phaseName: 'js-phase' },
    { ext: 'mjs', dir: 'mjs-config', phaseName: 'mjs-phase' },
    { ext: 'cjs', dir: 'cjs-config', phaseName: 'cjs-phase' },
  ])('loads a .$ext config file', async ({ dir, phaseName }) => {
    const config = await loadConfig(fixture(dir));

    expect(config.phases).toHaveLength(1);
    expect(config.phases[0]?.name).toBe(phaseName);
  });

  it('prefers .js over .ts when both are present', async () => {
    const config = await loadConfig(fixture('priority-config'));

    expect(config.phases[0]?.name).toBe('priority-js-phase');
  });

  it('throws when no config file is found', async () => {
    await expect(loadConfig(fixture('missing-config'))).rejects.toThrow();
  });
});
