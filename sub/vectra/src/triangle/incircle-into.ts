import { readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { CircleWritable, TriangleLike, XYWritable } from '../types';

/**
 * triangle의 내접원(incircle)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 내접원의 중심은 내심(incenter)이고, 반지름 = 넓이 / 반둘레다.
 * perimeter가 0이면 out을 수정하지 않고 false를 반환한다.
 * collinear triangle은 perimeter > 0이므로 계산 결과를 기록하고 out을 반환한다(반지름은 0이 된다).
 *
 * @param out 내접원을 기록할 writable output
 * @param triangle 내접원을 계산할 triangle
 * @returns out 또는 false(perimeter === 0)
 */
export function incircleInto<Out extends CircleWritable<XYWritable>>(out: Out, triangle: TriangleLike): Out | false {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // a = 변 BC (vertex A 맞은편), b = 변 CA (vertex B 맞은편), c = 변 AB (vertex C 맞은편)
  const a = Math.hypot(cx - bx, cy - by);
  const b = Math.hypot(ax - cx, ay - cy);
  const c = Math.hypot(bx - ax, by - ay);
  const perimeter = a + b + c;
  if (perimeter === 0) return false;
  const ix = (a * ax + b * bx + c * cx) / perimeter;
  const iy = (a * ay + b * by + c * cy) / perimeter;
  writeXY(out.center, ix, iy);
  // radius = |signedArea| / semiperimeter
  // signedArea = signedArea2x / 2, semiperimeter = perimeter / 2
  // → radius = (signedArea2x / 2) / (perimeter / 2) = signedArea2x / perimeter
  out.radius = Math.abs(triangleSignedArea2x(triangle)) / perimeter;
  return out;
}
