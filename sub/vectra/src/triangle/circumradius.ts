import { readTriangleRawCoords } from '../internal/triangle';
import { solveTriangleCircumcenter } from '../internal/triangle-circumcenter';
import type { TriangleLike } from '../types';

const center = { x: 0, y: 0 };

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
  if (!solveTriangleCircumcenter(center, triangle)) return undefined;
  const { ax, ay } = readTriangleRawCoords(triangle);
  return Math.hypot(ax - center.x, ay - center.y);
}
