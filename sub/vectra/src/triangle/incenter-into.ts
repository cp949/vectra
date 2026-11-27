import type { Triangle, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * triangle의 내심(incenter)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 내심은 세 변 길이로 가중 평균한 vertex 위치다.
 * perimeter가 0이면(점 triangle) out을 수정하지 않고 false를 반환한다.
 * collinear triangle은 perimeter > 0이므로 계산 결과를 그대로 기록하고 out을 반환한다.
 *
 * @param out 내심 좌표를 기록할 점 객체
 * @param triangle 내심을 계산할 triangle
 * @returns out 또는 false(perimeter === 0)
 */
export function incenterInto<Out extends PointWritable>(out: Out, triangle: Triangle): Out | false {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  // a = 변 BC (vertex A 맞은편), b = 변 CA (vertex B 맞은편), c = 변 AB (vertex C 맞은편)
  const a = hypot2(cx - bx, cy - by);
  const b = hypot2(ax - cx, ay - cy);
  const c = hypot2(bx - ax, by - ay);
  const perimeter = a + b + c;
  if (perimeter === 0) return false;
  out.x = (a * ax + b * bx + c * cx) / perimeter;
  out.y = (a * ay + b * by + c * cy) / perimeter;
  return out;
}
