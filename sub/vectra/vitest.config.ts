import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// 빌드된 dist는 Vite 변환 없이 Node가 직접 import한다.
// 변환은 메인 프로세스 한 곳에서 처리한다. 병렬 부하에서 dist barrel import가 timeout을 넘긴다.
// 패키지 소비자와 같은 Node ESM 로딩 경로를 검증하는 효과도 있다.
const distDir = fileURLToPath(new URL('./dist/', import.meta.url));
const distPattern = new RegExp(`^${distDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

// 테스트 파일마다 worker를 새로 띄우면 파일당 ~160ms가 든다. 677개 파일에서 전체 시간의 대부분이다.
// 기본 project는 isolate: false로 worker를 재사용한다.
// 전역 상태를 바꾸는 파일만 isolate: true project로 분리한다.
// 분리 기준: `vi.stubGlobal`, `vi.spyOn`, `process.env` 변경 같은 전역 변경.
// 새 테스트가 전역을 바꾸면 이 목록에 추가한다.
const isolatedTests = [
  'tests/unit/random/entropy.test.ts', // globalThis.crypto stub, Math.random spy
  'tests/unit/random/scalar.test.ts', // globalThis.crypto stub
  'tests/unit/random/secure-source.test.ts', // globalThis.crypto stub
];

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    server: {
      deps: {
        external: [distPattern],
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'shared',
          isolate: false,
          include: ['tests/**/*.test.ts'],
          exclude: ['**/node_modules/**', '**/dist/**', ...isolatedTests],
        },
      },
      {
        extends: true,
        test: {
          name: 'isolated',
          isolate: true,
          include: isolatedTests,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
});
