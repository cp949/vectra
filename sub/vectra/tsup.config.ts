import { defineConfig } from 'tsup';
import { buildEntrypoints } from './build-entrypoints';

export default defineConfig({
  entry: buildEntrypoints(),
  format: ['esm'],
  target: 'es2020',
  platform: 'neutral',
  dts: {
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  esbuildOptions(options) {
    options.legalComments = 'linked';
    options.keepNames = true;
  },
});
