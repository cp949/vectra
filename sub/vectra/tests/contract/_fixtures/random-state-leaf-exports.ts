/**
 * random-state는 typed fixture다.
 *
 * function-only 도메인은 source-derived fixture를 사용하지만, 이 파일은 runtime kind까지
 * package import contract에서 검증하므로 수동 목록을 유지한다.
 *
 * 아래 항목들이 이 목록과 일치해야 한다.
 *  - barrel re-export   : src/random-state/index.ts
 *  - leaf 파일          : src/random-state/<leafPath>.ts
 *  - package.json exports : domain barrel only
 *  - build entry         : sub/vectra/build-entrypoints.ts
 *  - public surface     : public-surface.test.ts expectedKeys
 */
export const randomStateLeafExports = [
  { exportName: 'createRandomState', leafPath: 'create-random-state', kind: 'function' },
  { exportName: 'rand', leafPath: 'rand', kind: 'object' },
] as const;
