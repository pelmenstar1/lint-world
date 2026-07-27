import { eslint, prettier, defineConfig, tsc, knip } from './src';

export default defineConfig({
  phases: [
    eslint(),
    prettier({
      cache: true,
    }),
    tsc(),
    knip(),
  ],
});
