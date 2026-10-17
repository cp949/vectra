import { readTriangleRawCoords } from '../internal/triangle';
import { solveTriangleCircumcenter } from '../internal/triangle-circumcenter';
import { writeXY } from '../internal/xy';
import type { CircleWritable, TriangleLike, XYWritable } from '../types';

const center = { x: 0, y: 0 };

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
  if (!solveTriangleCircumcenter(center, triangle)) return false;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  const ux = center.x;
  const uy = center.y;
  // nine-point center = circumcenter와 orthocenter의 중점.
  // orthocenter = (ax+bx+cx − 2ux, ay+by+cy − 2uy)이므로 중점은 ((ax+bx+cx−ux)/2, (ay+by+cy−uy)/2).
  writeXY(out.center, (ax + bx + cx - ux) / 2, (ay + by + cy - uy) / 2);
  // radius = circumradius 절반. ax/ux는 local이라 out.center aliasing 후에도 안전하다.
  out.radius = Math.hypot(ax - ux, ay - uy) / 2;
  return out;
}
