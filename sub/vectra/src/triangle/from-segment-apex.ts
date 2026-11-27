import { createZeroTriangle } from '../internal/triangle';
import type { Segment, TriangleWritable, Point } from '../types/flat-shapes.internal';
import { fromSegmentApexInto } from './from-segment-apex-into';

/**
 * fromSegmentApexInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `fromSegmentApexInto`와 동일하다.
 * zero-length base는 degenerate triangle로 기록한다.
 * NaN/Infinity 좌표는 validation 없이 그대로 기록한다.
 *
 * @param base 첫 두 vertex로 쓸 segment input
 * @param apex 세 번째 vertex point
 */
export function fromSegmentApex(base: Segment, apex: Point): TriangleWritable {
  const out = createZeroTriangle();
  return fromSegmentApexInto(out, base, apex);
}
