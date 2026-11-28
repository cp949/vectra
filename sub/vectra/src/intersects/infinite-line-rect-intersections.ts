import { DEFAULT_EPSILON } from '../internal/numeric';
import type { InfiniteLine, Rect, PointWritable } from '../types/flat-shapes.internal';
import { infiniteLineRectIntersectionsInto } from './infinite-line-rect-intersections-into';

/**
 * infinite-line와 rect boundary의 교점을 새 배열로 반환한다.
 *
 * `infiniteLineRectIntersectionsInto`의 allocating companion이다. boundary 4개 edge와의 교점을 모으고
 * corner/edge 중복을 dedupe하며, line parameter `t` 오름차순으로 반환한다. boundary 교점이
 * 없는 containment-only, empty box, degenerate direction(`dx = dy = 0`)은 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param line 교점을 구할 infinite-line
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function infiniteLineRectIntersections(
  line: InfiniteLine,
  rect: Rect,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  const out: PointWritable[] = [];
  infiniteLineRectIntersectionsInto(out, line, rect, epsilon);
  return out;
}
