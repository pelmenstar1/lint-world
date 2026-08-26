import { eslint, prettier, defineConfig, tsc, knip } from './src';

export default defineConfig({
  tools: [
    eslint(),
    prettier({
      cache: true,
    }),
    tsc(),
    knip(),
  ],
});
