import { eslint, prettier, defineConfig, tsc } from './src';

export default defineConfig({
  phases: [
    eslint(),
    prettier({
      cache: true,
    }),
    tsc(),
  ],
});
