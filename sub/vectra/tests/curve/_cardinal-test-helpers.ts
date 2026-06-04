/**
 * cardinal 분할 테스트 파일에서 공유하는 작은 helper.
 * float 비교 반복을 한 줄로 줄여 테스트 본문을 짧게 유지한다.
 */
import { expect } from 'vitest';

/**
 * 두 수가 tol 이내인지 단언한다.
 * 절대 오차 기반 비교를 사용한다.
 */
export function expectClose(actual: number, expected: number, tol = 1e-10): void {
  expect(Math.abs(actual - expected)).toBeLessThan(tol);
}

/**
 * point의 x/y가 모두 tol 이내인지 단언한다.
 * `*Into` 함수의 결과 비교에서 반복되는 두 줄 호출을 묶는다.
 */
export function expectPointClose(actual: { x: number; y: number }, x: number, y: number, tol = 1e-10): void {
  expectClose(actual.x, x, tol);
  expectClose(actual.y, y, tol);
}
