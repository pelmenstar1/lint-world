import path from 'node:path';
import type { AnyLintTool } from './tool.js';
import { createJiti } from 'jiti';
import { importOneOf } from './internal/jiti.js';

export type LintWorldConfig = {
  tools: AnyLintTool[];
};

const CONFIG_PREFIX = 'lint-world.config';
const EXTENSIONS = ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts'];

export function defineConfig(config: LintWorldConfig): LintWorldConfig {
  return config;
}

export async function loadConfig(
  rootDir: string = process.cwd(),
): Promise<LintWorldConfig> {
  const jiti = createJiti(import.meta.url, {
    tsconfigPaths: true,
  });

  const moduleNames = EXTENSIONS.map((ext) =>
    path.join(rootDir, `${CONFIG_PREFIX}.${ext}`),
  );

  const config = await importOneOf<LintWorldConfig>(jiti, moduleNames, {
    default: true,
  });

  return config;
}
