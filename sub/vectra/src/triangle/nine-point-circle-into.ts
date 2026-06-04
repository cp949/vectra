import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { CircleWritable, TriangleLike, XYWritable } from '../types';

/**
 * triangle의 nine-point circle(구점원)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 중심은 외심(circumcenter)과 수심(orthocenter)의 중점(Euler line 중점)이고,
 * 반지름은 외접원 반지름(circumradius)의 절반이다.
 * degenerate triangle(collinear 또는 non-finite vertex)이면 out을 수정하지 않고 false를 반환한다.
 * out.center가 triangle vertex와 같은 storage여도 안전하다(aliasing 허용).
 *
 * @param out nine-point circle을 기록할 writable output
 * @param triangle nine-point circle을 계산할 triangle
 * @returns out 또는 false(degenerate)
 */
export function ninePointCircleInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  triangle: TriangleLike
): Out | false {
  if (hasNonFiniteVertex(triangle)) return false;
  const area2x = triangleSignedArea2x(triangle);
  if (area2x === 0) return false;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // circumcenter raw formula (public leaf import 금지 — raw 계산).
  // denominator는 guard에 쓰인 signed area와 같은 전개(D === 2 × signedArea2x)로 묶는다.
  // raw 좌표 전개 D = 2*(ax*(by-cy)+...)는 float 반올림이 달라 near-collinear(signedArea2x≠0)에서
  // D=0이 될 수 있고, 그러면 guard를 통과한 뒤 division-by-zero로 Infinity를 쓴다.
  const D = 2 * area2x;
  const a2 = ax ** 2 + ay ** 2;
  const b2 = bx ** 2 + by ** 2;
  const c2 = cx ** 2 + cy ** 2;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / D;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / D;
  // nine-point center = circumcenter와 orthocenter의 중점.
  // orthocenter = (ax+bx+cx − 2ux, ay+by+cy − 2uy)이므로 중점은 ((ax+bx+cx−ux)/2, (ay+by+cy−uy)/2).
  writeXY(out.center, (ax + bx + cx - ux) / 2, (ay + by + cy - uy) / 2);
  // radius = circumradius 절반. ax/ux는 local이라 out.center aliasing 후에도 안전하다.
  out.radius = Math.hypot(ax - ux, ay - uy) / 2;
  return out;
}
