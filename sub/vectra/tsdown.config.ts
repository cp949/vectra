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
  // keepNames를 켜지 않는다. 도메인 barrel을 한 파일로 병합하므로,
  // 켜면 최상위 `__name(...)` 호출이 남아 tree-shaking을 막는다.
});
