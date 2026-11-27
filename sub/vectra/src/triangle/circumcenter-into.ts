import { solveTriangleCircumcenter } from '../internal/triangle-circumcenter';
import type { Triangle, PointWritable } from '../types/flat-shapes.internal';

const center = { x: 0, y: 0 };

/**
 * triangle의 외심(circumcenter)을 계산해 out에 기록하고 out을 반환한다.
 *
 * degenerate triangle(collinear 또는 non-finite vertex)이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out 외심 좌표를 기록할 점 객체
 * @param triangle 외심을 계산할 triangle
 * @returns out 또는 false(degenerate)
 */
export function circumcenterInto<Out extends PointWritable>(out: Out, triangle: Triangle): Out | false {
  if (!solveTriangleCircumcenter(center, triangle)) return false;
  out.x = center.x;
  out.y = center.y;
  return out;
}
