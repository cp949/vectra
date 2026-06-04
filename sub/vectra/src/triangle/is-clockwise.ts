import { triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle의 vertex 순서가 시계 방향(CW)이면 true를 반환한다.
 *
 * degenerate triangle(넓이 0)이면 false를 반환한다.
 *
 * @param triangle winding 방향을 확인할 triangle
 */
export function isClockwise(triangle: TriangleLike): boolean {
  return triangleSignedArea2x(triangle) < 0;
}
