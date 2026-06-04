import { hasNonFiniteVertex, triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle이 degenerate인지 반환한다.
 *
 * vertex 중 non-finite 좌표(NaN, Infinity, -Infinity)가 있으면 degenerate로 판단한다.
 * 그 외에는 `Math.abs(signedArea) <= epsilon`을 기준으로 판단한다.
 * epsilon 기본값은 0(exact zero)이다.
 *
 * @param triangle degenerate 여부를 확인할 triangle
 * @param epsilon 넓이 허용 오차 (기본값 0, 음수이면 RangeError)
 */
export function isDegenerate(triangle: TriangleLike, epsilon = 0): boolean {
  if (epsilon < 0) throw new RangeError('epsilon must be non-negative');
  if (hasNonFiniteVertex(triangle)) return true;
  // triangleSignedArea2x = signedArea * 2. epsilon * 2로 비교해 Math.abs(signedArea) <= epsilon과 동치를 유지한다.
  return Math.abs(triangleSignedArea2x(triangle)) <= epsilon * 2;
}
