import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { SegmentWritable, TriangleLike, XYWritable } from '../types';

/**
 * triangle의 Euler line을 segment로 out에 기록하고 out을 반환한다.
 *
 * out.a는 centroid(세 vertex arithmetic mean), out.b는 orthocenter(수심)다.
 * degenerate triangle(collinear / single-point)이거나 non-finite vertex이면 out을 수정하지 않고
 * false를 반환한다. 실패 정책은 orthocenterInto와 동일하다(centroid는 항상 정의되지만 orthocenter가
 * degenerate에서 정의되지 않으므로 Euler line도 실패한다).
 * 정삼각형처럼 centroid와 orthocenter가 일치하면 zero-length segment를 기록하고 성공한다.
 * input과 output이 같은 object여도 안전하다(aliasing 허용).
 *
 * @param out Euler line을 기록할 writable output (out.a=centroid, out.b=orthocenter)
 * @param triangle Euler line을 계산할 triangle
 * @returns out 또는 false(degenerate / non-finite)
 */
export function eulerLineInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
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
  // centroid = 세 vertex 평균, orthocenter = 세 vertex 합 − 2 × circumcenter (Euler line 관계)
  const gx = (ax + bx + cx) / 3;
  const gy = (ay + by + cy) / 3;
  const hx = ax + bx + cx - 2 * ux;
  const hy = ay + by + cy - 2 * uy;
  // self-aliasing 안전: 모든 좌표를 local 변수로 읽은 뒤 기록
  writeXY(out.a, gx, gy);
  writeXY(out.b, hx, hy);
  return out;
}
