import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle 외접원(circumcircle)의 반지름을 반환한다.
 *
 * 외심(circumcenter)과 vertex A 사이 거리를 반환한다. `circumcircleInto` / `circumcircle`의
 * radius 계약과 같은 값을 반환한다.
 * degenerate triangle(signedArea가 0이거나 non-finite vertex)이면 undefined를 반환한다.
 * signedArea === 0은 collinear와 세 vertex가 한 점인 경우를 모두 포함한다.
 *
 * @param triangle 외접원 반지름을 계산할 triangle
 * @returns 외접원 반지름. degenerate triangle이면 undefined
 */
export function circumradius(triangle: TriangleLike): number | undefined {
  if (hasNonFiniteVertex(triangle)) return undefined;
  const area2x = triangleSignedArea2x(triangle);
  if (area2x === 0) return undefined;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // denominator는 guard에 쓰인 signed area와 같은 전개(D === 2 × signedArea2x)로 묶는다.
  // raw 좌표 전개 D = 2*(ax*(by-cy)+...)는 float 반올림이 달라 near-collinear(signedArea2x≠0)에서
  // D=0이 될 수 있고, 그러면 guard를 통과한 뒤 division-by-zero로 Infinity를 쓴다.
  const D = 2 * area2x;
  const a2 = ax ** 2 + ay ** 2;
  const b2 = bx ** 2 + by ** 2;
  const c2 = cx ** 2 + cy ** 2;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / D;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / D;
  return Math.hypot(ax - ux, ay - uy);
}
