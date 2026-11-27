import type { InfiniteLine, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * `point`에서 infinite-line으로 내린 수선의 발을 `out`에 기록하고 `out`을 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 origin을 기록한다.
 */
export function projectPointInto<Out extends PointWritable>(out: Out, line: InfiniteLine, point: Point): Out {
  const { ox, oy, dx, dy } = line;
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
