import { readTriangleRawCoords } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { TriangleLike, XYWritable } from '../types';

/**
 * triangle의 내심(incenter)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 내심은 세 변 길이로 가중 평균한 vertex 위치다.
 * perimeter가 0이면(점 triangle) out을 수정하지 않고 false를 반환한다.
 * collinear triangle은 perimeter > 0이므로 계산 결과를 그대로 기록하고 out을 반환한다.
 *
 * @param out 내심 좌표를 기록할 writable output
 * @param triangle 내심을 계산할 triangle
 * @returns out 또는 false(perimeter === 0)
 */
export function incenterInto<Out extends XYWritable>(out: Out, triangle: TriangleLike): Out | false {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // a = 변 BC (vertex A 맞은편), b = 변 CA (vertex B 맞은편), c = 변 AB (vertex C 맞은편)
  const a = Math.hypot(cx - bx, cy - by);
  const b = Math.hypot(ax - cx, ay - cy);
  const c = Math.hypot(bx - ax, by - ay);
  const perimeter = a + b + c;
  if (perimeter === 0) return false;
  writeXY(out, (a * ax + b * bx + c * cx) / perimeter, (a * ay + b * by + c * cy) / perimeter);
  return out;
}
