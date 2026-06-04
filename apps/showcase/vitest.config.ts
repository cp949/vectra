import { defineConfig } from 'vitest/config';

const playgroundSourceEntry = new URL('../../sub/playground/src/index.ts', import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
      '@repo/playground': playgroundSourceEntry,
    },
  },
  test: {
    environment: 'node',
  },
});
