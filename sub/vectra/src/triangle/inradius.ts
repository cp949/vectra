import { readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle 내접원(incircle)의 반지름을 반환한다.
 *
 * 반지름 = |넓이| / 반둘레 = |signedArea2x| / perimeter다. `incircleInto` / `incircle`의
 * radius 계약과 같은 값을 반환한다.
 * perimeter가 0이면(세 vertex가 한 점) undefined를 반환한다.
 * collinear triangle은 perimeter > 0이므로 0을 반환한다.
 * non-finite vertex는 IEEE 754 연산 결과를 그대로 반환한다(예: NaN).
 *
 * @param triangle 내접원 반지름을 계산할 triangle
 * @returns 내접원 반지름. perimeter === 0이면 undefined
 */
export function inradius(triangle: TriangleLike): number | undefined {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const a = Math.hypot(cx - bx, cy - by);
  const b = Math.hypot(ax - cx, ay - cy);
  const c = Math.hypot(bx - ax, by - ay);
  const perimeter = a + b + c;
  if (perimeter === 0) return undefined;
  return Math.abs(triangleSignedArea2x(triangle)) / perimeter;
}
