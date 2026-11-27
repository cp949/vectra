import type { RayWritable, Segment } from '../types/flat-shapes.internal';

/**
 * 선분을 `(ox, oy) = (x1, y1)`, `(dx, dy) = (x2 - x1, y2 - y1)`로 `out`에 기록하고 `out`을 반환한다.
 *
 * zero-length segment는 degenerate ray(direction = 0)가 된다.
 */
export function fromSegmentInto<Out extends RayWritable>(out: Out, line: Segment): Out {
  const { x1, y1, x2, y2 } = line;
  out.ox = x1;
  out.oy = y1;
  out.dx = x2 - x1;
  out.dy = y2 - y1;
  return out;
}
