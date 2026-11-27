import { flatTriangleSignedArea2x } from '../internal/triangle';
import type { Triangle } from '../types/flat-shapes.internal';

/**
 * triangle의 넓이(양수)를 반환한다.
 *
 * winding 방향에 무관하게 항상 0 이상의 값을 반환한다.
 *
 * @param triangle 넓이를 계산할 triangle
 */
export function area(triangle: Triangle): number {
  return Math.abs(flatTriangleSignedArea2x(triangle)) / 2;
}
