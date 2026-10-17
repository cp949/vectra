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
      // 전역 기준이다. shared와 isolated 두 project의 합산에 적용한다.
      // statements, branches, lines는 실측(97.33, 93.49, 97.86)에서 약 2%p 아래로 둔다.
      // functions만 예외다. 실측 99.93(2994/2996)에서 약 1%p 아래로 둔다.
      // 미커버 2개는 public API로 호출되지 않는다.
      // - curve-speed.internal.ts: 퇴화 반지름의 `integrate: () => 0`. speedLength가 from === to에서 먼저 0을 반환한다.
      // - segment-segment-collinear.internal.ts: `collinearSortAxis`의 `key: (x) => x`. 방어 분기다.
      // 99는 미커버 약 29개까지 허용한다. 미커버가 2개보다 늘면 새 함수의 테스트 누락을 의심한다.
      thresholds: {
        statements: 95,
        branches: 91,
        functions: 99,
        lines: 95,
      },
    },
  },
});
