/**
 * shape builder 테스트에서 공유하는 float 비교 helper.
 *
 * 각 builder 테스트 파일이 동일한 tolerance 정책으로 좌표 값을 비교하도록 모은다.
 */

import { expect } from 'vitest';

/**
 * 좌표/길이 값을 ulp 기반 혼합 tolerance로 비교한다.
 *
 * 절대 차이는 최소 1e-9이고, 큰 좌표 값에 대해서는 expected 또는 scale의 절대값에 1e-9를 곱한
 * 상대 허용치를 함께 적용한다. scale은 expected만으로 표현되지 않는 큰 reference 좌표가 있을 때
 * 전달한다.
 */
export function expectClose(actual: number, expected: number, scale = 1): void {
  const tol = Math.max(1e-9, Math.abs(expected) * 1e-9, Math.abs(scale) * 1e-9);
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
}
