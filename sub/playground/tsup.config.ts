import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2020',
  platform: 'browser',
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
