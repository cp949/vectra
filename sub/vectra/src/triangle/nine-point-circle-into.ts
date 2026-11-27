import { solveTriangleCircumcenter } from '../internal/triangle-circumcenter';
import type { CircleWritable, Triangle } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

const center = { x: 0, y: 0 };

/**
 * triangle의 nine-point circle(구점원)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 중심은 외심(circumcenter)과 수심(orthocenter)의 중점(Euler line 중점)이고,
 * 반지름은 외접원 반지름(circumradius)의 절반이다.
 * degenerate triangle(collinear 또는 non-finite vertex)이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out nine-point circle을 기록할 원 객체
 * @param triangle nine-point circle을 계산할 triangle
 * @returns out 또는 false(degenerate)
 */
export function ninePointCircleInto<Out extends CircleWritable>(out: Out, triangle: Triangle): Out | false {
  if (!solveTriangleCircumcenter(center, triangle)) return false;
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  const ux = center.x;
  const uy = center.y;
  // nine-point center = circumcenter와 orthocenter의 중점.
  // orthocenter = (ax+bx+cx − 2ux, ay+by+cy − 2uy)이므로 중점은 ((ax+bx+cx−ux)/2, (ay+by+cy−uy)/2).
  out.cx = (ax + bx + cx - ux) / 2;
  out.cy = (ay + by + cy - uy) / 2;
  // radius = circumradius 절반. 꼭짓점과 외심 좌표는 기록 전에 읽는다.
  out.r = hypot2(ax - ux, ay - uy) / 2;
  return out;
}
