import { expect } from 'vitest';

// 작은 절대 오차와 큰 값에 대한 상대 오차를 혼합한 tolerance helper.
// trig 좌표 차에 ulp 수준의 미세한 오차가 누적될 수 있으므로 Number.EPSILON 직접 비교는 사용하지 않는다.
export function expectClose(actual: number, expected: number, scale = 1): void {
  const tol = Math.max(1e-12, Math.abs(expected) * 1e-12, Math.abs(scale) * 1e-12);
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
}
