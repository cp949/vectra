import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2020',
  platform: 'browser',
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
