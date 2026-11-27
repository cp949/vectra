import type { InfiniteLineWritable, Segment } from '../types/flat-shapes.internal';

/**
 * segment `a -> b`를 `origin = a`, `direction = b - a`로 `out`에 기록하고 `out`을 반환한다.
 *
 * zero-length segment는 degenerate infinite-line(direction = 0)이 된다.
 */
export function fromSegmentInto<Out extends InfiniteLineWritable>(out: Out, line: Segment): Out {
  // alias 위험은 없지만 component 일관성을 위해 모든 좌표를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  out.ox = ax;
  out.oy = ay;
  out.dx = bx - ax;
  out.dy = by - ay;
  return out;
}
