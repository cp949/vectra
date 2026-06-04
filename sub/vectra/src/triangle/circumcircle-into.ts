import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { CircleWritable, TriangleLike, XYWritable } from '../types';

/**
 * triangle의 외접원(circumcircle)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 외접원의 중심은 외심(circumcenter)이고, 반지름은 외심-vertex 거리다.
 * degenerate triangle이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out 외접원을 기록할 writable output
 * @param triangle 외접원을 계산할 triangle
 * @returns out 또는 false(degenerate)
 */
export function circumcircleInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  triangle: TriangleLike
): Out | false {
  if (hasNonFiniteVertex(triangle)) return false;
  const area2x = triangleSignedArea2x(triangle);
  if (area2x === 0) return false;
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
  writeXY(out.center, ux, uy);
  out.radius = Math.hypot(ax - ux, ay - uy);
  return out;
}
