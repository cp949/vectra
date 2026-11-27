import type { Ray, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * `point`에서 ray supporting infinite-line으로 내린 수선의 발을 `out`에 기록하고 `out`을 반환한다.
 *
 * unclamped — ray forward/backward 구분 없이 supporting infinite-line 기준으로 계산한다.
 * degenerate ray(`directionLengthSq === 0`)에서는 origin을 기록한다.
 */
export function projectPointInto<Out extends PointWritable>(out: Out, ray: Ray, point: Point): Out {
  const { ox, oy, dx, dy } = ray;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    out.x = ox;
    out.y = oy;
    return out;
  }
  const px = point.x - ox;
  const py = point.y - oy;
  const t = (px * dx + py * dy) / lenSq;
  out.x = ox + t * dx;
  out.y = oy + t * dy;
  return out;
}
