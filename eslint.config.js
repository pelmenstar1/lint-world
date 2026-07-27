// @ts-check

import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'dist',
      'node_modules',
      'eslint.config.js',
      'prettier.config.js',
      'knip.config.ts',
      'lint-world.config.ts',
      'src/**/*.*js',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
]);
