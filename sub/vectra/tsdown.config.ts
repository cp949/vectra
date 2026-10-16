import { defineConfig } from 'tsdown';
import { buildEntrypoints } from './build-entrypoints.ts';

export default defineConfig({
  entry: buildEntrypoints(),
  format: ['esm'],
  target: 'es2020',
  platform: 'neutral',
  fixedExtension: false,
  dts: {
    sourcemap: false,
  },
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  outputOptions: {
    keepNames: true,
  },
});
