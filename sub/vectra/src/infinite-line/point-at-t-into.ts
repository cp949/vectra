import type { InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * `origin + direction * t` 위치를 `out`에 기록하고 `out`을 반환한다.
 *
 * `t`는 clamp하지 않는다. degenerate infinite-line(direction = 0)에서는 `t`에 무관하게 origin을 기록한다.
 */
export function pointAtTInto<Out extends PointWritable>(out: Out, line: InfiniteLine, t: number): Out {
  const { ox, oy, dx, dy } = line;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    out.x = ox;
    out.y = oy;
    return out;
  }
  out.x = ox + t * dx;
  out.y = oy + t * dy;
  return out;
}
