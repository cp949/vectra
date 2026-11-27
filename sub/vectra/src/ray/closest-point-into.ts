import type { Ray, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray 위에서 `point`와 가장 가까운 점을 `out`에 기록하고 `out`을 반환한다.
 *
 * `t`를 `[0, Infinity)`로 clamp한다. backward point(t < 0)는 origin에 고정된다.
 * degenerate ray(`directionLengthSq === 0`)에서는 origin을 기록한다.
 */
export function closestPointInto<Out extends PointWritable>(out: Out, ray: Ray, point: Point): Out {
  const { ox, oy, dx, dy } = ray;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    out.x = ox;
    out.y = oy;
    return out;
  }
  const px = point.x - ox;
  const py = point.y - oy;
  // t를 [0, Infinity)로 clamp — backward는 origin에 고정
  const t = Math.max(0, (px * dx + py * dy) / lenSq);
  out.x = ox + t * dx;
  out.y = oy + t * dy;
  return out;
}
