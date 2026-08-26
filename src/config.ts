import path from 'node:path';
import type { AnyLintTool } from './tool.js';
import { createJiti } from 'jiti';

export type LintWorldConfig = {
  tools: AnyLintTool[];
};

const EXTENSIONS = ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts'];

export function defineConfig(config: LintWorldConfig): LintWorldConfig {
  return config;
}

function getConfigName(extension: string): string {
  return `lint-world.config.${extension}`;
}

export async function loadConfig(
  rootDir: string = process.cwd(),
): Promise<LintWorldConfig> {
  const jiti = createJiti(import.meta.url, {
    tsconfigPaths: true,
  });

  for (const extension of EXTENSIONS) {
    const configPath = path.join(rootDir, getConfigName(extension));

    const config = await jiti.import<LintWorldConfig | undefined>(configPath, {
      try: true,
    });

    if (config !== undefined) {
      return config;
    }
  }

  throw new Error(
    `Configuration for lint-world is required. Tried: ${EXTENSIONS.map(getConfigName).join(', ')}`,
  );
}
