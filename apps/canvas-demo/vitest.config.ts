import { defineConfig } from 'vitest/config';

const playgroundSourceEntry = new URL('../../sub/playground/src/index.ts', import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
      '@repo/playground': playgroundSourceEntry,
      'virtual:vectra-sandbox-js': new URL('./src/test-fixtures/vectra-sandbox-js.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
  },
});
