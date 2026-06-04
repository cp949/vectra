import type { TriangleLike, XYInput } from '../types';
import { containsPoint } from './contains-point';

/**
 * points의 모든 point가 triangle 내부 또는 경계(edge/vertex) 위에 있으면 true를 반환한다.
 *
 * - 빈 배열은 true를 반환한다 (vacuous truth).
 * - closed boundary 정책: edge 또는 vertex 위의 point는 true로 판정한다.
 * - degenerate triangle(collinear, epsilon=0 기준 signed area 2x === 0)이면
 *   non-empty points에 대해 false를 반환한다.
 * - 첫 번째 false에서 short-circuit한다. 이후 point는 읽지 않는다.
 * - points 배열과 point object를 mutate하지 않는다.
 *
 * @param triangle 판정 대상 triangle
 * @param points 판정할 point 배열. 읽기 전용.
 * @param epsilon boundary proximity threshold. 각 point 판정에 그대로 전달된다 (기본값 0).
 * @returns 모든 point가 triangle 내부/경계에 있으면 true
 */
export function containsPoints(triangle: TriangleLike, points: readonly XYInput[], epsilon = 0): boolean {
  return points.every((point) => containsPoint(triangle, point, epsilon));
}
