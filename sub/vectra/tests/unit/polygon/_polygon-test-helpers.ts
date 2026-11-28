/**
 * polygon 테스트가 함께 쓰는 수치 비교 helper를 모은다.
 */
import { expect } from 'vitest';

/**
 * 작은 절대 오차와 큰 값의 상대 오차를 섞은 허용 오차로 두 수를 비교한다.
 * trig 좌표 차에 ulp 수준 오차가 쌓이므로 Number.EPSILON 직접 비교는 쓰지 않는다.
 */
export function expectClose(actual: number, expected: number, scale = 1): void {
  const tol = Math.max(1e-12, Math.abs(expected) * 1e-12, Math.abs(scale) * 1e-12);
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
}
