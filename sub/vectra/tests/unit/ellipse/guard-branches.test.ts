/**
 * ellipse closest point Newton 반복 테스트.
 *
 * `ellipseClosestPointAngle`은 JSDoc에 적힌 목적함수 `f(θ) = (cos θ - dx/rx)² + (sin θ - dy/ry)²`의
 * 정류점으로 수렴한다. 초기 추정 `atan2(dy/ry, dx/rx)`가 이미 정류점이라 보통 한 번에 끝난다. `epsilon`이 0이면
 * 수렴 판정이 항상 거짓이라 상한 64회를 모두 돌고, 반복 중에도 정류점에서 벗어나지 않는지 확인한다.
 *
 * 이 함수의 목적함수는 정규화 공간의 거리라서 `rx !== ry`인 ellipse에서는 유클리드 최근접점과 다르다.
 * 이 테스트는 그 목적함수의 수렴만 확인하며 최근접점의 정확성은 다루지 않는다.
 */

import { describe, expect, test } from 'vitest';
import { ellipseClosestPointAngle } from '../../../src/ellipse/ellipse-closest-point.internal';

/** 목적함수 `f(θ)`의 도함수 절반 `-sin θ (cos θ - ux) + cos θ (sin θ - uy)`를 계산한다. */
function halfDerivative(theta: number, ux: number, uy: number): number {
  return -Math.sin(theta) * (Math.cos(theta) - ux) + Math.cos(theta) * (Math.sin(theta) - uy);
}

describe('ellipseClosestPointAngle', () => {
  test.each([
    [3, 2, 2, 1],
    [-0.5, 0.25, 4, 1],
    [1, -3, 1, 3],
  ])("점 (%s, %s)에서 반복이 정류점 f'(θ) = 0으로 수렴한다", (dx, dy, rx, ry) => {
    const theta = ellipseClosestPointAngle(dx, dy, rx, ry, 1e-10);
    expect(Math.abs(halfDerivative(theta, dx / rx, dy / ry))).toBeLessThan(1e-9);
  });

  test('epsilon이 0이어도 64회 반복 뒤 정류점에 머문다', () => {
    const theta = ellipseClosestPointAngle(3, 2, 2, 1, 0);
    expect(Math.abs(halfDerivative(theta, 3 / 2, 2 / 1))).toBeLessThan(1e-9);
  });
});
