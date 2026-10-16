import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// 빌드된 dist는 Vite 변환 없이 Node가 직접 import한다.
// 변환은 메인 프로세스 한 곳에서 처리한다. 병렬 부하에서 dist barrel import가 timeout을 넘긴다.
// 패키지 소비자와 같은 Node ESM 로딩 경로를 검증하는 효과도 있다.
const distDir = fileURLToPath(new URL('./dist/', import.meta.url));
const distPattern = new RegExp(`^${distDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    server: {
      deps: {
        external: [distPattern],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
});
