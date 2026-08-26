import path from 'node:path';
import type { AnyLintTool } from './tool.js';
import { createJiti } from 'jiti';

/**
 * The configuration for lint-world.
 */
export type LintWorldConfig = {
  /*
   * The tools to use in lint-world.
   */
  tools: AnyLintTool[];
};

const EXTENSIONS = ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts'];

/**
 * A helper to define a config, primarily for type inference.
 *
 * @example
 * import { defineConfig } from 'lint-world';
 *
 * export default defineConfig({
 *   tools: [],
 * });
 */
export function defineConfig(config: LintWorldConfig): LintWorldConfig {
  return config;
}

function getConfigName(extension: string): string {
  return `lint-world.config.${extension}`;
}

/**
 * Loads the lint-world configuration from {@link rootDir}.
 *
 * @param rootDir directory to look for the configuration file in, defaults to the current working directory
 * @returns the loaded configuration
 * @throws if no configuration file is found
 */
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
