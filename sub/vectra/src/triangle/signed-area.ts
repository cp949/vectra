import { triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle의 signed area를 반환한다.
 *
 * 반시계 방향(CCW) winding이면 양수, 시계 방향(CW)이면 음수, 넓이가 0이면 0이다.
 *
 * @param triangle signed area를 계산할 triangle
 */
export function signedArea(triangle: TriangleLike): number {
  return triangleSignedArea2x(triangle) / 2;
}
