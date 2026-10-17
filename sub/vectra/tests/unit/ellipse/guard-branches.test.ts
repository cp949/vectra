/**
 * ellipse closest point Newton 반복 테스트.
 *
 * `ellipseClosestPointAngle`은 Euclidean 거리 제곱 `(rx cos θ - dx)² + (ry sin θ - dy)²`의
 * 정류점으로 수렴한다. `epsilon`이 0이면 수렴 판정이 step이 정확히 0일 때만 참이라 상한 64회 안에서 끝나야 한다.
 * 반환한 θ에서 거리 제곱의 도함수가 0에 가까운지 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { ellipseClosestPointAngle } from '../../../src/ellipse/ellipse-closest-point.internal';

/**
 * Euclidean 거리 제곱의 θ 도함수 절반을 계산한다.
 * 반지름으로 나눠 단위 없는 값으로 만든다.
 */
function halfDerivative(theta: number, dx: number, dy: number, rx: number, ry: number): number {
  const scale = Math.max(rx, ry) ** 2;
  return (
    ((rx * Math.cos(theta) - dx) * -rx * Math.sin(theta) + (ry * Math.sin(theta) - dy) * ry * Math.cos(theta)) / scale
  );
}

describe('ellipseClosestPointAngle', () => {
  test.each([
    [3, 2, 2, 1],
    [-0.5, 0.25, 4, 1],
    [1, -3, 1, 3],
  ])("점 (%s, %s)에서 반복이 정류점 f'(θ) = 0으로 수렴한다", (dx, dy, rx, ry) => {
    const theta = ellipseClosestPointAngle(dx, dy, rx, ry, 1e-10);
    expect(Math.abs(halfDerivative(theta, dx, dy, rx, ry))).toBeLessThan(1e-9);
  });

  test('epsilon이 0이어도 반복 상한 안에서 정류점에 머문다', () => {
    const theta = ellipseClosestPointAngle(3, 2, 2, 1, 0);
    expect(Math.abs(halfDerivative(theta, 3, 2, 2, 1))).toBeLessThan(1e-9);
  });
});
