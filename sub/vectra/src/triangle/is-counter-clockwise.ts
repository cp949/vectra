import { triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle의 vertex 순서가 반시계 방향(CCW)이면 true를 반환한다.
 *
 * degenerate triangle(넓이 0)이면 false를 반환한다.
 *
 * @param triangle winding 방향을 확인할 triangle
 */
export function isCounterClockwise(triangle: TriangleLike): boolean {
  return triangleSignedArea2x(triangle) > 0;
}
