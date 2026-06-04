import { expect } from 'vitest';

export type TestMatrix = {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
};

/** 테스트용 MatrixWritable 생성 helper */
export function makeMatrix(): TestMatrix {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
}

/** 두 matrix component가 근사적으로 같은지 확인하는 helper */
export function expectNearMatrix(actual: TestMatrix, expected: TestMatrix, epsilon = 1e-10) {
  expect(Math.abs(actual.a - expected.a)).toBeLessThanOrEqual(epsilon);
  expect(Math.abs(actual.b - expected.b)).toBeLessThanOrEqual(epsilon);
  expect(Math.abs(actual.c - expected.c)).toBeLessThanOrEqual(epsilon);
  expect(Math.abs(actual.d - expected.d)).toBeLessThanOrEqual(epsilon);
  expect(Math.abs(actual.tx - expected.tx)).toBeLessThanOrEqual(epsilon);
  expect(Math.abs(actual.ty - expected.ty)).toBeLessThanOrEqual(epsilon);
}
