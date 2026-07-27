import { KnipConfig } from 'knip';

export default {
  ignoreFiles: ['lint-world.config.ts'],
  entry: ['src/__tests__/fixtures/**/*.*{js,ts}'],
} as KnipConfig;
