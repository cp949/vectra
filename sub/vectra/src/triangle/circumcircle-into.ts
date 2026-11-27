import { solveTriangleCircumcenter } from '../internal/triangle-circumcenter';
import type { CircleWritable, Triangle } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

const center = { x: 0, y: 0 };

/**
 * triangle의 외접원(circumcircle)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 외접원의 중심은 외심(circumcenter)이고, 반지름은 외심-vertex 거리다.
 * degenerate triangle이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out 외접원을 기록할 원 객체
 * @param triangle 외접원을 계산할 triangle
 * @returns out 또는 false(degenerate)
 */
export function circumcircleInto<Out extends CircleWritable>(out: Out, triangle: Triangle): Out | false {
  if (!solveTriangleCircumcenter(center, triangle)) return false;
  const { x1: ax, y1: ay } = triangle;
  out.cx = center.x;
  out.cy = center.y;
  out.r = hypot2(ax - center.x, ay - center.y);
  return out;
}
